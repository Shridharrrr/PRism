from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
from agents.graph import prism_graph
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

@router.post("/analyze")
async def analyze_pr(req: AnalyzeRequest):
    # Create review row with pending status
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
        # Fetch PR data from GitHub
        diff = await fetch_pr_diff(req.owner, req.repo, req.pr_number, req.github_token)
        metadata = await fetch_pr_metadata(req.owner, req.repo, req.pr_number, req.github_token)

        # Run LangGraph pipeline
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

        # Update review status to complete
        supabase.table("reviews").update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", review_id).execute()

        return {"review_id": review_id, "status": "completed", "result": result}

    except Exception as e:
        supabase.table("reviews").update({
            "status": "failed"
        }).eq("id", review_id).execute()
        raise HTTPException(status_code=500, detail=str(e))