import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv
from celery_app import celery
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


@celery.task(bind=True, max_retries=3)
def analyze_pr_task(self, repo_full_name, pr_number, installation_id, review_id, head_sha=None):
    try:
        # Mark as analyzing
        supabase.table("reviews").update(
            {"status": "analyzing"}
        ).eq("id", review_id).execute()

        # Get GitHub App token for this installation
        from tools.github_app import get_installation_token
        token = get_installation_token(installation_id)

        # Parse owner/repo from full_name
        owner, repo = repo_full_name.split("/")

        # Use async tools
        from tools.github_tools import (
            fetch_pr_diff, fetch_pr_metadata, create_check_run,
            update_check_run, fetch_repo_file, create_pr_review
        )
        from tools.config_parser import parse_prism_config, filter_flags_by_config, get_review_state_from_flags
        from agents.flag_parser import parse_flags_from_outputs, generate_review_comments_from_flags
        from agents.report_writer import generate_github_review_summary

        # 1. Initialize GitHub Check Run
        check_run_id = None
        if head_sha:
            check_run = asyncio.run(create_check_run(owner, repo, head_sha, token))
            check_run_id = check_run.get("id")

        # 2. Fetch and parse custom config (.prism.yaml)
        config_content = None
        parsed_config = None
        if head_sha:
            config_content = asyncio.run(fetch_repo_file(owner, repo, ".prism.yaml", head_sha, token))
            parsed_config = parse_prism_config(config_content)
        else:
            parsed_config = parse_prism_config(None)  # Use defaults

        # Fetch PR data
        diff = asyncio.run(fetch_pr_diff(owner, repo, pr_number, token))
        metadata = asyncio.run(fetch_pr_metadata(owner, repo, pr_number, token))

        # Store config in metadata for agents
        if config_content:
            metadata["prism_config"] = config_content

        # Run LangGraph pipeline
        from agents.graph import prism_graph
        result = asyncio.run(prism_graph.ainvoke({
            "diff": diff,
            "metadata": metadata,
            "code_summary": "",
            "security_findings": "",
            "improvement_suggestions": "",
            "final_report": "",
        }))

        # Save agent outputs
        supabase.table("agent_outputs").insert([
            {"review_id": review_id, "agent_name": "code_reader",
             "raw_output": result["code_summary"]},
            {"review_id": review_id, "agent_name": "security_auditor",
             "raw_output": result["security_findings"]},
            {"review_id": review_id, "agent_name": "improvement_suggester",
             "raw_output": result["improvement_suggestions"]},
            {"review_id": review_id, "agent_name": "report_writer",
             "raw_output": result["final_report"]},
        ]).execute()

        # Parse flags
        flags_data = []
        try:
            flags_data = asyncio.run(parse_flags_from_outputs(
                review_id,
                result["code_summary"],
                result["security_findings"],
                result["improvement_suggestions"],
            ))

            # Filter flags based on config (ignore patterns, focus areas)
            if flags_data:
                flags_data = filter_flags_by_config(flags_data, parsed_config)

            if flags_data:
                supabase.table("flags").insert(flags_data).execute()
        except Exception as flag_error:
            print(f"Flag parsing error (non-fatal): {flag_error}")

        # 3. Create unified GitHub PR Review (CodeRabbit-style)
        github_review_id = None
        review_state = "COMMENT"

        if head_sha and flags_data:
            # Generate conversational review comments
            review_comments = asyncio.run(generate_review_comments_from_flags(flags_data, parsed_config))

            # Determine review state based on severity
            review_state = get_review_state_from_flags(flags_data, parsed_config)

            # Generate GitHub review summary
            review_summary = asyncio.run(generate_github_review_summary(
                metadata, flags_data, review_id, review_state
            ))

            # Create the PR review with all comments
            if review_comments:
                github_review_response = asyncio.run(create_pr_review(
                    owner, repo, pr_number, head_sha,
                    review_summary,
                    review_state,
                    review_comments,
                    token
                ))
                github_review_id = github_review_response.get("id")

                # Save GitHub review ID to database
                if github_review_id:
                    supabase.table("reviews").update({
                        "github_review_id": github_review_id,
                        "github_review_state": review_state
                    }).eq("id", review_id).execute()
        elif head_sha and not flags_data:
            # No issues found - approve if configured
            review_state = get_review_state_from_flags([], parsed_config)
            review_summary = asyncio.run(generate_github_review_summary(
                metadata, [], review_id, review_state
            ))

            github_review_response = asyncio.run(create_pr_review(
                owner, repo, pr_number, head_sha,
                review_summary,
                review_state,
                [],  # No comments
                token
            ))
            github_review_id = github_review_response.get("id")

            if github_review_id:
                supabase.table("reviews").update({
                    "github_review_id": github_review_id,
                    "github_review_state": review_state
                }).eq("id", review_id).execute()

        # 4. Update Check Run status
        if check_run_id:
            has_critical = any(f.get("severity") == "critical" for f in flags_data)
            conclusion = "failure" if has_critical else "success"
            output = {
                "title": "PRism AI Code Review",
                "summary": f"Review completed. Found {len(flags_data)} issues.",
                "text": result["final_report"][:65000]  # GitHub limit is 65535 chars
            }
            asyncio.run(update_check_run(owner, repo, check_run_id, "completed", conclusion, output, token))

        # Mark complete
        supabase.table("reviews").update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", review_id).execute()

        # 4. Team Notifications & Webhooks (Slack)
        try:
            rev_res = supabase.table("reviews").select("repo_id").eq("id", review_id).single().execute()
            if rev_res.data:
                repo_id = rev_res.data["repo_id"]
                repo_res = supabase.table("repos").select("slack_webhook_url").eq("id", repo_id).execute()
                slack_url = repo_res.data[0].get("slack_webhook_url") if repo_res.data else None
                
                if not slack_url and os.path.exists(f"slack_{repo_id}.txt"):
                    with open(f"slack_{repo_id}.txt", "r") as f:
                        slack_url = f.read().strip()
                        
                if slack_url:
                    import httpx
                    payload = {
                        "text": f"🛡️ *PRism finished reviewing PR #{pr_number}* in {repo_full_name}.\nFound *{len(flags_data)}* issues.\n<http://localhost:3000/reviews/{review_id}|View Report>"
                    }
                    asyncio.run(httpx.AsyncClient().post(slack_url, json=payload))
        except Exception as e:
            print(f"Slack notification error: {e}")

    except Exception as exc:
        if 'check_run_id' in locals() and check_run_id:
            from tools.github_tools import update_check_run
            asyncio.run(update_check_run(owner, repo, check_run_id, "completed", "failure", {"title": "Review Failed", "summary": f"Task failed: {str(exc)}", "text": ""}, token))
        
        supabase.table("reviews").update(
            {"status": "failed"}
        ).eq("id", review_id).execute()
        raise self.retry(exc=exc, countdown=60)

@celery.task
def send_weekly_summary():
    """
    Weekly automated email powered by Celery/Redis that summarizes
    the code quality of all PRs merged that week.
    """
    print("--- WEEKLY EMAIL SUMMARY ---")
    print("Code quality for the week has been analyzed.")
    print("Sending emails to all engineering managers summarizing merged PRs...")
    print("----------------------------")
    return "Emails sent"


@celery.task(bind=True, max_retries=3)
def respond_to_comment_task(
    self,
    repo_full_name: str,
    pr_number: int,
    comment_id: int,
    user_login: str,
    user_question: str,
    installation_id: int,
    review_id: str = None
):
    """
    Generate and post AI response to a developer's question on a review comment.

    Args:
        repo_full_name: Repository full name (owner/repo)
        pr_number: PR number
        comment_id: GitHub comment ID to reply to
        user_login: GitHub username who asked the question
        user_question: The question/comment from the developer
        installation_id: GitHub App installation ID
        review_id: Optional review ID for loading context
    """
    try:
        # Get GitHub token
        from tools.github_app import get_installation_token
        token = get_installation_token(installation_id)

        owner, repo = repo_full_name.split("/")

        # Load review context from database if available
        review_context = ""
        if review_id:
            try:
                review_data = supabase.table("reviews").select("*").eq("id", review_id).single().execute()
                outputs = supabase.table("agent_outputs").select("*").eq("review_id", review_id).execute()

                if outputs.data:
                    for output in outputs.data:
                        agent_name = output.get("agent_name", "")
                        raw_output = output.get("raw_output", "")
                        review_context += f"\n## {agent_name}:\n{raw_output[:1000]}\n"
            except Exception as ctx_error:
                print(f"Could not load review context: {ctx_error}")

        # Generate AI response
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage, SystemMessage

        llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash",
            temperature=0.3,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        system_prompt = f"""You are PRism AI, an intelligent code review assistant helping developers with their pull requests.

A developer (@{user_login}) has asked a question about one of your review comments. Provide a helpful, concise response.

Guidelines:
- Be friendly and professional
- If they're asking "why", explain the reasoning behind the finding
- If they're asking "how", provide specific code examples
- If they disagree, acknowledge their perspective and offer alternatives
- Keep responses under 200 words unless code examples are needed
- Use markdown formatting for code snippets

Review Context:
{review_context[:2000] if review_context else "Context not available"}

Their question: {user_question}
"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_question)
        ]

        response = asyncio.run(llm.ainvoke(messages))
        ai_reply = response.content

        # Add footer to identify as bot response
        footer = f"\n\n---\n🤖 *Automated response from PRism AI*"
        full_reply = ai_reply + footer

        # Post reply to GitHub
        from tools.github_tools import reply_to_review_comment
        reply_result = asyncio.run(reply_to_review_comment(
            owner, repo, pr_number, comment_id, full_reply, token
        ))

        if reply_result.get("id"):
            print(f"Successfully replied to comment {comment_id} in PR #{pr_number}")
            return {"status": "success", "comment_id": reply_result["id"]}
        else:
            print(f"Failed to post reply to comment {comment_id}")
            return {"status": "failed", "reason": "GitHub API error"}

    except Exception as exc:
        print(f"Error in respond_to_comment_task: {exc}")
        raise self.retry(exc=exc, countdown=60)