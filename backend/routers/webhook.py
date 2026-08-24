import hashlib
import hmac
import json
import os
from fastapi import APIRouter, Request, HTTPException
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api", tags=["webhooks"], redirect_slashes=False)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

from pydantic import BaseModel

class RepoSettings(BaseModel):
    slack_webhook_url: str

@router.patch("/repos/{repo_id}/settings")
async def update_repo_settings(repo_id: str, req: RepoSettings):
    try:
        supabase.table("repos").update({"slack_webhook_url": req.slack_webhook_url}).eq("id", repo_id).execute()
    except Exception as e:
        print(f"Schema might not support slack_webhook_url: {e}")
        with open(f"slack_{repo_id}.txt", "w") as f:
            f.write(req.slack_webhook_url)
    return {"status": "success"}


def verify_signature(payload: bytes, signature: str) -> bool:
    secret = os.getenv("GITHUB_WEBHOOK_SECRET", "").encode()
    expected = "sha256=" + hmac.new(
        secret, payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhooks/github")
async def github_webhook(request: Request):
    payload_bytes = await request.body()
    signature = request.headers.get("x-hub-signature-256", "")

    if not verify_signature(payload_bytes, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = request.headers.get("x-github-event")
    payload = json.loads(payload_bytes)

    if event != "pull_request":
        return {"status": "ignored", "reason": "not a pull_request event"}

    action = payload.get("action")
    if action not in ["opened", "reopened", "synchronize"]:
        return {"status": "ignored", "reason": f"action '{action}' not tracked"}

    repo_full_name = payload["repository"]["full_name"]
    pr_number = payload["pull_request"]["number"]
    pr_title = payload["pull_request"]["title"]
    pr_url = payload["pull_request"]["html_url"]
    pr_author = payload["pull_request"]["user"]["login"]
    installation_id = payload["installation"]["id"]
    head_sha = payload["pull_request"]["head"]["sha"]

    # Look up repo in Supabase
    result = supabase.table("repos").select(
        "id, user_id, webhook_enabled"
    ).eq("full_name", repo_full_name).execute()

    if not result.data:
        return {"status": "ignored", "reason": "repo not connected to PRism"}

    repo = result.data[0]

    if not repo["webhook_enabled"]:
        return {"status": "ignored", "reason": "auto-trigger disabled"}

    # Save installation_id for future token generation
    supabase.table("repos").update(
        {"installation_id": installation_id}
    ).eq("id", repo["id"]).execute()

    # Create review row
    review = supabase.table("reviews").insert({
        "repo_id": repo["id"],
        "user_id": repo["user_id"],
        "pr_number": pr_number,
        "pr_title": pr_title,
        "pr_url": pr_url,
        "pr_author": pr_author,
        "status": "queued",
        "triggered_by": "webhook",
        "installation_id": installation_id,
    }).execute()

    review_id = review.data[0]["id"]

    # Queue the Celery task — returns to GitHub immediately
    from tasks import analyze_pr_task
    analyze_pr_task.delay(
        repo_full_name=repo_full_name,
        pr_number=pr_number,
        installation_id=installation_id,
        review_id=review_id,
        head_sha=head_sha
    )

    return {"status": "queued", "review_id": review_id}


@router.post("/webhooks/github/comments")
async def github_comment_webhook(request: Request):
    """
    Handle comment events on PRs for interactive AI responses.
    Supports: pull_request_review_comment, issue_comment
    """
    payload_bytes = await request.body()
    signature = request.headers.get("x-hub-signature-256", "")

    if not verify_signature(payload_bytes, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    event = request.headers.get("x-github-event")
    payload = json.loads(payload_bytes)

    # Get bot name from env (default: prism[bot])
    bot_name = os.getenv("PRISM_BOT_NAME", "prism[bot]")

    # Handle pull_request_review_comment (inline comments)
    if event == "pull_request_review_comment":
        action = payload.get("action")
        if action != "created":
            return {"status": "ignored", "reason": f"action '{action}' not tracked"}

        comment = payload.get("comment", {})
        pr = payload.get("pull_request", {})
        repo_full_name = payload["repository"]["full_name"]

        # Check if this is a reply to PRism's comment
        in_reply_to_id = comment.get("in_reply_to_id")
        if not in_reply_to_id:
            return {"status": "ignored", "reason": "not a reply to existing comment"}

        # Check if comment author is not the bot itself
        comment_author = comment.get("user", {}).get("login", "")
        if comment_author.lower() == bot_name.lower():
            return {"status": "ignored", "reason": "ignoring bot's own comment"}

        # Check if interactive responses are enabled
        enable_interactive = os.getenv("PRISM_INTERACTIVE_RESPONSES", "true").lower() == "true"
        if not enable_interactive:
            return {"status": "ignored", "reason": "interactive responses disabled"}

        # Extract details
        pr_number = pr.get("number")
        comment_id = comment.get("id")
        user_login = comment_author
        user_question = comment.get("body", "")
        installation_id = payload["installation"]["id"]

        # Try to find the review_id from the repo and PR number
        review_id = None
        try:
            repo_result = supabase.table("repos").select("id").eq(
                "full_name", repo_full_name
            ).execute()

            if repo_result.data:
                repo_id = repo_result.data[0]["id"]
                review_result = supabase.table("reviews").select("id").eq(
                    "repo_id", repo_id
                ).eq("pr_number", pr_number).order("created_at", desc=True).limit(1).execute()

                if review_result.data:
                    review_id = review_result.data[0]["id"]
        except Exception as e:
            print(f"Could not find review_id: {e}")

        # Queue AI response task
        from tasks import respond_to_comment_task

        # Add delay if configured
        response_delay = int(os.getenv("PRISM_RESPONSE_DELAY", "2"))
        respond_to_comment_task.apply_async(
            kwargs={
                "repo_full_name": repo_full_name,
                "pr_number": pr_number,
                "comment_id": comment_id,
                "user_login": user_login,
                "user_question": user_question,
                "installation_id": installation_id,
                "review_id": review_id
            },
            countdown=response_delay
        )

        return {"status": "queued", "comment_id": comment_id}

    # Handle issue_comment (general PR comments)
    elif event == "issue_comment":
        action = payload.get("action")
        if action != "created":
            return {"status": "ignored", "reason": f"action '{action}' not tracked"}

        issue = payload.get("issue", {})

        # Only handle if it's on a PR (issues have pull_request field when they're PRs)
        if "pull_request" not in issue:
            return {"status": "ignored", "reason": "not a PR comment"}

        comment = payload.get("comment", {})
        comment_author = comment.get("user", {}).get("login", "")

        # Ignore bot's own comments
        if comment_author.lower() == bot_name.lower():
            return {"status": "ignored", "reason": "ignoring bot's own comment"}

        # Check if comment mentions the bot or is asking a question
        comment_body = comment.get("body", "").lower()
        is_question = any(word in comment_body for word in ["@prism", "why", "how", "what", "can you", "could you", "?"])

        if not is_question:
            return {"status": "ignored", "reason": "not a question or mention"}

        # Check if interactive responses are enabled
        enable_interactive = os.getenv("PRISM_INTERACTIVE_RESPONSES", "true").lower() == "true"
        if not enable_interactive:
            return {"status": "ignored", "reason": "interactive responses disabled"}

        # Extract details
        repo_full_name = payload["repository"]["full_name"]
        pr_number = issue.get("number")
        comment_id = comment.get("id")
        user_login = comment_author
        user_question = comment.get("body", "")
        installation_id = payload["installation"]["id"]

        # Find review_id
        review_id = None
        try:
            repo_result = supabase.table("repos").select("id").eq(
                "full_name", repo_full_name
            ).execute()

            if repo_result.data:
                repo_id = repo_result.data[0]["id"]
                review_result = supabase.table("reviews").select("id").eq(
                    "repo_id", repo_id
                ).eq("pr_number", pr_number).order("created_at", desc=True).limit(1).execute()

                if review_result.data:
                    review_id = review_result.data[0]["id"]
        except Exception as e:
            print(f"Could not find review_id: {e}")

        # Queue AI response task
        from tasks import respond_to_comment_task

        response_delay = int(os.getenv("PRISM_RESPONSE_DELAY", "2"))
        respond_to_comment_task.apply_async(
            kwargs={
                "repo_full_name": repo_full_name,
                "pr_number": pr_number,
                "comment_id": comment_id,
                "user_login": user_login,
                "user_question": user_question,
                "installation_id": installation_id,
                "review_id": review_id
            },
            countdown=response_delay
        )

        return {"status": "queued", "comment_id": comment_id}

    else:
        return {"status": "ignored", "reason": f"event '{event}' not supported"}