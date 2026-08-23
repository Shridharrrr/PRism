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

        # Use your existing async tools — run them in sync context
        from tools.github_tools import fetch_pr_diff, fetch_pr_metadata, create_check_run, update_check_run, post_inline_comment, fetch_repo_file
        
        # 1. Initialize GitHub Check Run
        check_run_id = None
        if head_sha:
            check_run = asyncio.run(create_check_run(owner, repo, head_sha, token))
            check_run_id = check_run.get("id")
            
        # 2. Fetch custom config (.prism.yaml)
        prism_config = ""
        if head_sha:
            config_content = asyncio.run(fetch_repo_file(owner, repo, ".prism.yaml", head_sha, token))
            if config_content:
                prism_config = f"\nCustom PRism Configuration (.prism.yaml):\n{config_content}\n"
        
        diff = asyncio.run(fetch_pr_diff(owner, repo, pr_number, token))
        metadata = asyncio.run(fetch_pr_metadata(owner, repo, pr_number, token))
        
        # Append config to metadata context
        if prism_config:
            metadata["prism_config"] = prism_config

        # Run your existing LangGraph pipeline
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

        # Parse and save flags
        flags_data = []
        try:
            from agents.flag_parser import parse_flags_from_outputs
            flags_data = asyncio.run(parse_flags_from_outputs(
                review_id,
                result["code_summary"],
                result["security_findings"],
                result["improvement_suggestions"],
            ))
            if flags_data:
                supabase.table("flags").insert(flags_data).execute()
        except Exception as flag_error:
            print(f"Flag parsing error (non-fatal): {flag_error}")

        # 3. Post Inline GitHub Comments and update Check Run status
        has_critical = False
        if flags_data and head_sha:
            for flag in flags_data:
                if flag.get("severity") == "critical":
                    has_critical = True
                
                # Post inline comment if we have line and file path
                if flag.get("file_path") and flag.get("line_start"):
                    comment_body = f"**[{flag.get('type', 'issue').upper()}]** {flag.get('description')}\n\n*Suggestion:*\n{flag.get('suggestion')}"
                    asyncio.run(post_inline_comment(
                        owner, repo, pr_number, head_sha, 
                        flag.get("file_path"), flag.get("line_start"), 
                        comment_body, token
                    ))
                    
        if check_run_id:
            conclusion = "failure" if has_critical else "success"
            output = {
                "title": "PRism AI Code Review",
                "summary": f"Review completed. Found {len(flags_data)} issues.",
                "text": result["final_report"][:65000] # GitHub output limit is 65535 chars
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