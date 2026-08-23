from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter(prefix="/api", tags=["flags"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class DecisionRequest(BaseModel):
    decision: str  # "safe" or "confirmed"

@router.patch("/flags/{flag_id}/decision")
async def update_flag_decision(flag_id: str, req: DecisionRequest):
    if req.decision not in ["safe", "confirmed"]:
        raise HTTPException(status_code=400, detail="Decision must be safe or confirmed")

    result = supabase.table("flags").update({
        "user_decision": req.decision
    }).eq("id", flag_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Flag not found")

    return {"flag_id": flag_id, "decision": req.decision}

@router.post("/flags/{flag_id}/fix")
async def fix_flag(flag_id: str):
    # 1. Fetch flag
    flag_res = supabase.table("flags").select("*").eq("id", flag_id).single().execute()
    if not flag_res.data:
        raise HTTPException(404, "Flag not found")
    flag = flag_res.data
    
    if not flag.get("file_path"):
        raise HTTPException(400, "Flag does not have a file_path")

    # 2. Fetch review and repo
    review_res = supabase.table("reviews").select("*").eq("id", flag["review_id"]).single().execute()
    review = review_res.data
    repo_res = supabase.table("repos").select("*").eq("id", review["repo_id"]).single().execute()
    repo = repo_res.data
    
    owner, repo_name = repo["full_name"].split("/")
    
    # 3. Get installation token
    from tools.github_app import get_installation_token
    token = get_installation_token(review["installation_id"])
    
    # 4. Fetch the file content from PR branch
    import httpx, base64
    from tools.github_tools import fetch_pr_metadata
    metadata = await fetch_pr_metadata(owner, repo_name, review["pr_number"], token)
    branch = metadata["head_branch"]
    
    url = f"https://api.github.com/repos/{owner}/{repo_name}/contents/{flag['file_path']}?ref={branch}"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers)
        if res.status_code != 200:
            raise HTTPException(400, f"Could not fetch file from GitHub: {res.text}")
        file_data = res.json()
        current_sha = file_data["sha"]
        file_content = base64.b64decode(file_data["content"]).decode('utf-8')
        
    # 5. Use LLM to apply the fix
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.messages import HumanMessage
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, google_api_key=os.getenv("GOOGLE_API_KEY"))
    prompt = f"""You are an automated refactoring tool. 
Apply the following fix to the file content.
ISSUE: {flag['description']}
SUGGESTION: {flag['suggestion']}

FILE CONTENT:
```
{file_content}
```

Return ONLY the completely updated file content with the fix applied. Do not include markdown codeblocks (no ```). Just the raw text of the file."""
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    new_content = response.content.strip()
    if new_content.startswith("```"):
        new_content = "\n".join(new_content.split("\n")[1:])
        if new_content.endswith("```"):
            new_content = new_content[:-3]
    
    # 6. Push the commit
    put_url = f"https://api.github.com/repos/{owner}/{repo_name}/contents/{flag['file_path']}"
    put_data = {
        "message": f"PRism Auto-Fix: {flag.get('type', 'issue')}",
        "content": base64.b64encode(new_content.encode('utf-8')).decode('utf-8'),
        "sha": current_sha,
        "branch": branch
    }
    async with httpx.AsyncClient() as client:
        put_res = await client.put(put_url, headers=headers, json=put_data)
        if put_res.status_code >= 400:
            raise HTTPException(400, f"Failed to commit fix: {put_res.text}")
            
    supabase.table("flags").update({"user_decision": "safe"}).eq("id", flag_id).execute()
    return {"status": "fixed"}