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
def analyze_pr_task(self, repo_full_name, pr_number, installation_id, review_id):
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
        from tools.github_tools import fetch_pr_diff, fetch_pr_metadata
        diff = asyncio.run(fetch_pr_diff(owner, repo, pr_number, token))
        metadata = asyncio.run(fetch_pr_metadata(owner, repo, pr_number, token))

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
        try:
            from agents.flag_parser import parse_flags_from_outputs
            flags = asyncio.run(parse_flags_from_outputs(
                review_id,
                result["code_summary"],
                result["security_findings"],
                result["improvement_suggestions"],
            ))
            if flags:
                supabase.table("flags").insert(flags).execute()
        except Exception as flag_error:
            print(f"Flag parsing error (non-fatal): {flag_error}")

        # Mark complete
        supabase.table("reviews").update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", review_id).execute()

    except Exception as exc:
        supabase.table("reviews").update(
            {"status": "failed"}
        ).eq("id", review_id).execute()
        raise self.retry(exc=exc, countdown=60)