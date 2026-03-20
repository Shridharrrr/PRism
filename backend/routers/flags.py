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