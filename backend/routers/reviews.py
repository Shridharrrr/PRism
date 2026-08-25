from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from agents.graph import prism_graph
from agents.flag_parser import parse_flags_from_outputs
from tools.github_tools import fetch_pr_diff, fetch_pr_metadata, fetch_open_prs
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/api", tags=["reviews"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class AnalyzeRequest(BaseModel):
    repo_id: str
    owner: str
    repo: str
    pr_number: int
    pr_title: str
    pr_url: str
    pr_author: str
    user_id: str
    github_token: str

@router.get("/repos/{owner}/{repo}/prs")
async def get_open_prs(owner: str, repo: str, token: str):
    try:
        prs = await fetch_open_prs(owner, repo, token)
        return {"prs": prs}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reviews/{review_id}")
async def get_review(review_id: str):
    review = supabase.table("reviews").select("*").eq("id", review_id).single().execute()
    outputs = supabase.table("agent_outputs").select("*").eq("review_id", review_id).execute()
    flags = supabase.table("flags").select("*").eq("review_id", review_id).execute()
    return {
        "review": review.data,
        "agent_outputs": outputs.data,
        "flags": flags.data,
    }

class ChatRequest(BaseModel):
    message: str

@router.post("/reviews/{review_id}/chat")
async def chat_with_pr(review_id: str, req: ChatRequest):
    review = supabase.table("reviews").select("*").eq("id", review_id).single().execute()
    if not review.data:
        raise HTTPException(404, "Review not found")
        
    outputs = supabase.table("agent_outputs").select("raw_output").eq("review_id", review_id).eq("agent_name", "code_reader").single().execute()
    code_summary = outputs.data["raw_output"] if outputs.data else ""

    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage, SystemMessage
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        temperature=0.5,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    
    messages = [
        SystemMessage(content=f"You are PRism AI, an expert code reviewer and friendly mentor assisting a developer with their PR. Here is the context of the PR:\n\n{code_summary}\n\nYour goal is to explain issues clearly and conversationally. Avoid giving dry, textbook bullet points. Instead, talk to the user in a humanized, empathetic way. Think step-by-step (ReAct pattern) to identify the core issue, explain *why* it matters in real-world terms, and guide the user to the solution naturally. If they ask for code, provide the fixed code block with a clear, friendly explanation."),
        HumanMessage(content=req.message)
    ]
    
    response = await llm.ainvoke(messages)
    return {"reply": response.content}

@router.post("/analyze")
async def analyze_pr(req: AnalyzeRequest):
    review = supabase.table("reviews").insert({
        "repo_id": req.repo_id,
        "user_id": req.user_id,
        "pr_number": req.pr_number,
        "pr_title": req.pr_title,
        "pr_url": req.pr_url,
        "pr_author": req.pr_author,
        "status": "analyzing",
    }).execute()

    review_id = review.data[0]["id"]

    try:
        diff = await fetch_pr_diff(
            req.owner, req.repo, req.pr_number, req.github_token
        )
        metadata = await fetch_pr_metadata(
            req.owner, req.repo, req.pr_number, req.github_token
        )

        result = await prism_graph.ainvoke({
            "diff": diff,
            "metadata": metadata,
            "code_summary": "",
            "security_findings": "",
            "improvement_suggestions": "",
            "final_report": "",
        })

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

        # Parse and save flags - non-fatal if this fails
        try:
            flags = await parse_flags_from_outputs(
                review_id,
                result["code_summary"],
                result["security_findings"],
                result["improvement_suggestions"],
            )
            if flags:
                supabase.table("flags").insert(flags).execute()
        except Exception as flag_error:
            print(f"Flag parsing error (non-fatal): {flag_error}")

        # Always mark completed if agents ran successfully
        supabase.table("reviews").update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", review_id).execute()

        return {"review_id": review_id, "status": "completed"}

    except Exception as e:
        # Mark failed only if the core pipeline broke
        supabase.table("reviews").update({
            "status": "failed"
        }).eq("id", review_id).execute()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    reviews_res = supabase.table("reviews").select("*").execute()
    flags_res = supabase.table("flags").select("*").execute()

    reviews = reviews_res.data or []
    flags = flags_res.data or []

    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)

    trends = []
    for i in range(14, -1, -1):
        date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        trends.append({"date": date, "bugs": 0})

    for flag in flags:
        created_at_str = flag.get("created_at")
        if created_at_str:
            try:
                dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                date_str = dt.strftime("%Y-%m-%d")
                for t in trends:
                    if t["date"] == date_str:
                        t["bugs"] += 1
                        break
            except:
                pass

    vuln_counts = {}
    for flag in flags:
        t = flag.get("type", "issue")
        vuln_counts[t] = vuln_counts.get(t, 0) + 1

    vuln_pie = [{"name": k, "value": v} for k, v in vuln_counts.items()]

    author_scores = {}
    review_map = {r["id"]: r for r in reviews}
    for flag in flags:
        r = review_map.get(flag["review_id"])
        if r:
            author = r["pr_author"]
            if author not in author_scores:
                author_scores[author] = {"clean_prs": 0, "issues_found": 0, "issues_fixed": 0}
            author_scores[author]["issues_found"] += 1
            if flag.get("user_decision") == "safe":
                author_scores[author]["issues_fixed"] += 1

    for r in reviews:
        author = r["pr_author"]
        if author not in author_scores:
            author_scores[author] = {"clean_prs": 0, "issues_found": 0, "issues_fixed": 0}

        pr_flags = [f for f in flags if f["review_id"] == r["id"]]
        if len(pr_flags) == 0:
            author_scores[author]["clean_prs"] += 1

    leaderboard = [{"author": k, **v} for k, v in author_scores.items()]
    leaderboard.sort(key=lambda x: x["issues_fixed"], reverse=True)

    return {
        "trends": trends,
        "vulnerabilities": vuln_pie,
        "leaderboard": leaderboard
    }


@router.get("/reviews/{review_id}/github-review")
async def get_github_review_details(review_id: str):
    """
    Get GitHub review details including review ID, state, and comment threads.
    """
    try:
        review = supabase.table("reviews").select(
            "github_review_id, github_review_state, repo_id, pr_number, installation_id"
        ).eq("id", review_id).single().execute()

        if not review.data:
            raise HTTPException(404, "Review not found")

        review_data = review.data
        github_review_id = review_data.get("github_review_id")
        review_state = review_data.get("github_review_state")

        # Get repo details for GitHub API calls
        repo_result = supabase.table("repos").select("full_name").eq(
            "id", review_data["repo_id"]
        ).single().execute()

        if not repo_result.data:
            raise HTTPException(404, "Repository not found")

        repo_full_name = repo_result.data["full_name"]
        owner, repo = repo_full_name.split("/")

        # Get installation token and fetch comments
        comments = []
        if github_review_id and review_data.get("installation_id"):
            from tools.github_app import get_installation_token
            from tools.github_tools import fetch_pr_review_comments

            token = get_installation_token(review_data["installation_id"])
            comments = await fetch_pr_review_comments(
                owner, repo, review_data["pr_number"], token
            )

        return {
            "review_id": review_id,
            "github_review_id": github_review_id,
            "review_state": review_state,
            "repo_full_name": repo_full_name,
            "pr_number": review_data["pr_number"],
            "comments": comments
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/{review_id}/comments")
async def get_review_comments(review_id: str):
    """
    Get all review comments for a specific review with thread status.
    """
    try:
        # Get flags associated with this review
        flags = supabase.table("flags").select("*").eq("review_id", review_id).execute()

        # Get review details
        review = supabase.table("reviews").select(
            "repo_id, pr_number, installation_id"
        ).eq("id", review_id).single().execute()

        if not review.data:
            raise HTTPException(404, "Review not found")

        # Get repo details
        repo_result = supabase.table("repos").select("full_name").eq(
            "id", review.data["repo_id"]
        ).single().execute()

        if not repo_result.data:
            raise HTTPException(404, "Repository not found")

        repo_full_name = repo_result.data["full_name"]
        owner, repo = repo_full_name.split("/")

        # Fetch GitHub comments
        comments = []
        if review.data.get("installation_id"):
            from tools.github_app import get_installation_token
            from tools.github_tools import fetch_pr_review_comments

            token = get_installation_token(review.data["installation_id"])
            github_comments = await fetch_pr_review_comments(
                owner, repo, review.data["pr_number"], token
            )

            # Match flags with GitHub comments
            for comment in github_comments:
                comment_data = {
                    "id": comment.get("id"),
                    "path": comment.get("path"),
                    "line": comment.get("line"),
                    "body": comment.get("body"),
                    "user": comment.get("user", {}).get("login"),
                    "created_at": comment.get("created_at"),
                    "in_reply_to_id": comment.get("in_reply_to_id"),
                }
                comments.append(comment_data)

        return {
            "review_id": review_id,
            "flags": flags.data or [],
            "comments": comments
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reviews/{review_id}/dismiss")
async def dismiss_review(review_id: str, message: str = "Review dismissed"):
    """
    Dismiss a GitHub PR review.
    """
    try:
        review = supabase.table("reviews").select(
            "github_review_id, repo_id, pr_number, installation_id"
        ).eq("id", review_id).single().execute()

        if not review.data:
            raise HTTPException(404, "Review not found")

        review_data = review.data
        github_review_id = review_data.get("github_review_id")

        if not github_review_id:
            raise HTTPException(400, "No GitHub review to dismiss")

        # Get repo details
        repo_result = supabase.table("repos").select("full_name").eq(
            "id", review_data["repo_id"]
        ).single().execute()

        if not repo_result.data:
            raise HTTPException(404, "Repository not found")

        repo_full_name = repo_result.data["full_name"]
        owner, repo = repo_full_name.split("/")

        # Dismiss the review
        from tools.github_app import get_installation_token
        from tools.github_tools import dismiss_pr_review

        token = get_installation_token(review_data["installation_id"])
        result = await dismiss_pr_review(
            owner, repo, review_data["pr_number"],
            github_review_id, message, token
        )

        return {"status": "dismissed", "result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repos/{repo_id}/config")
async def get_repo_config(repo_id: str):
    """
    Get .prism.yaml configuration for a repository.
    """
    try:
        repo = supabase.table("repos").select(
            "full_name, installation_id"
        ).eq("id", repo_id).single().execute()

        if not repo.data:
            raise HTTPException(404, "Repository not found")

        repo_data = repo.data
        owner, repo_name = repo_data["full_name"].split("/")

        # Fetch .prism.yaml from default branch
        from tools.github_app import get_installation_token
        from tools.github_tools import fetch_repo_file

        token = get_installation_token(repo_data["installation_id"])

        # Try to fetch from main/master
        config_content = None
        for branch in ["main", "master"]:
            config_content = await fetch_repo_file(
                owner, repo_name, ".prism.yaml", branch, token
            )
            if config_content:
                break

        if not config_content:
            # Return default config
            from tools.config_parser import DEFAULT_CONFIG
            return {"config": None, "defaults": DEFAULT_CONFIG}

        from tools.config_parser import parse_prism_config
        parsed_config = parse_prism_config(config_content)

        return {
            "config": config_content,
            "parsed": parsed_config
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UpdateConfigRequest(BaseModel):
    config_yaml: str


@router.put("/repos/{repo_id}/config")
async def update_repo_config(repo_id: str, req: UpdateConfigRequest):
    """
    Update .prism.yaml configuration (stores locally, user must commit to repo).
    Note: This endpoint can be expanded to create PR with config changes.
    """
    try:
        # Validate the YAML
        from tools.config_parser import parse_prism_config
        parsed = parse_prism_config(req.config_yaml)

        # For now, just return validation result
        # In production, could create a PR with the config change
        return {
            "status": "validated",
            "parsed": parsed,
            "message": "Config is valid. Commit .prism.yaml to your repository to apply."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid config: {str(e)}")