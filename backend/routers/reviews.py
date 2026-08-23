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
        model="gemini-2.5-flash",
        temperature=0.3,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    
    messages = [
        SystemMessage(content=f"You are PRism AI, an expert code reviewer assisting a developer with their PR. Here is the context of the PR:\n\n{code_summary}\n\nAnswer the developer's questions concisely. If they ask for code, provide the fixed code block."),
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

        # Parse and save flags — non-fatal if this fails
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