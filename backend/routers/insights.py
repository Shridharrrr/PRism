from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict
import os

from fastapi import APIRouter, HTTPException
from supabase import create_client

from agents.pr_insights import calculate_pr_insights
from agents.debt_tracker import calculate_quality_trends
from agents.security_compliance import build_security_report
from agents.performance_analyzer import summarize_performance_findings

router = APIRouter(prefix="/api", tags=["insights"])

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


def _safe_table_select(table_name: str, columns: str = "*"):
    try:
        return supabase.table(table_name).select(columns).execute().data or []
    except Exception:
        return []


def _safe_single(table_name: str, columns: str = "*", **filters):
    try:
        query = supabase.table(table_name).select(columns)
        for key, value in filters.items():
            query = query.eq(key, value)
        return query.single().execute().data
    except Exception:
        return None


@router.get("/reviews")
async def list_reviews(limit: int = 50):
    try:
        reviews = supabase.table("reviews").select("*").order(
            "created_at", desc=True
        ).limit(limit).execute().data or []
        review_ids = [review["id"] for review in reviews]
        flags = []
        if review_ids:
            flags = supabase.table("flags").select("*").in_("review_id", review_ids).execute().data or []

        flags_by_review = defaultdict(list)
        for flag in flags:
            flags_by_review[flag.get("review_id")].append(flag)

        enriched = []
        for review in reviews:
            review_flags = flags_by_review.get(review["id"], [])
            severity_counts = Counter(flag.get("severity", "info") for flag in review_flags)
            enriched.append({
                **review,
                "flags_summary": {
                    "critical": severity_counts.get("critical", 0),
                    "warning": severity_counts.get("warning", 0),
                    "info": severity_counts.get("info", 0),
                },
                "flag_count": len(review_flags),
            })

        return {"reviews": enriched}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reviews/{review_id}/insights")
async def get_review_insights(review_id: str):
    review = _safe_single("reviews", "*", id=review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    flags = supabase.table("flags").select("*").eq("review_id", review_id).execute().data or []

    existing = _safe_single("pr_insights", "*", review_id=review_id)
    if existing:
        return {"insights": existing, "source": "stored"}

    prior_reviews = []
    if review.get("repo_id"):
        repo_reviews = supabase.table("reviews").select("id, repo_id, created_at").eq(
            "repo_id", review["repo_id"]
        ).neq("id", review_id).order("created_at", desc=True).limit(25).execute().data or []
        repo_review_ids = [item["id"] for item in repo_reviews]
        prior_flags = []
        if repo_review_ids:
            prior_flags = supabase.table("flags").select("review_id, type").in_(
                "review_id", repo_review_ids
            ).execute().data or []
        flag_types_by_review = defaultdict(list)
        for flag in prior_flags:
            flag_types_by_review[flag.get("review_id")].append(flag.get("type"))
        prior_reviews = [
            {**item, "flag_types": flag_types_by_review.get(item["id"], [])}
            for item in repo_reviews
        ]

    insights = calculate_pr_insights(review, flags, prior_reviews)

    try:
        supabase.table("pr_insights").upsert(insights, on_conflict="review_id").execute()
    except Exception:
        pass

    return {"insights": insights, "source": "computed"}


@router.get("/repos/{repo_id}/quality-trends")
async def get_quality_trends(repo_id: str):
    repo = _safe_single("repos", "*", id=repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    reviews = supabase.table("reviews").select("*").eq("repo_id", repo_id).order(
        "created_at", desc=False
    ).execute().data or []
    review_ids = [review["id"] for review in reviews]
    flags = []
    if review_ids:
        flags = supabase.table("flags").select("*").in_("review_id", review_ids).execute().data or []

    trends = calculate_quality_trends(reviews, flags)
    return {"repo": repo, "quality": trends}


@router.get("/repos/{repo_id}/security-compliance")
async def get_security_compliance(repo_id: str):
    repo = _safe_single("repos", "*", id=repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    reviews = supabase.table("reviews").select("id").eq("repo_id", repo_id).execute().data or []
    review_ids = [review["id"] for review in reviews]
    flags = []
    if review_ids:
        flags = supabase.table("flags").select("*").in_("review_id", review_ids).execute().data or []

    report = build_security_report(repo, flags)
    return {"security": report}


@router.get("/dashboard/insights")
async def get_dashboard_insights():
    reviews = supabase.table("reviews").select("*").order(
        "created_at", desc=True
    ).limit(100).execute().data or []
    flags = _safe_table_select("flags", "*")
    repos = _safe_table_select("repos", "*")

    review_ids = {review["id"] for review in reviews}
    scoped_flags = [flag for flag in flags if flag.get("review_id") in review_ids]

    flags_by_review = defaultdict(list)
    for flag in scoped_flags:
        flags_by_review[flag.get("review_id")].append(flag)

    recent_reviews = []
    for review in reviews[:10]:
        review_flags = flags_by_review.get(review["id"], [])
        severity_counts = Counter(flag.get("severity", "info") for flag in review_flags)
        recent_reviews.append({
            **review,
            "flags_summary": {
                "critical": severity_counts.get("critical", 0),
                "warning": severity_counts.get("warning", 0),
                "info": severity_counts.get("info", 0),
            },
            "flag_count": len(review_flags),
        })

    now = datetime.now(timezone.utc)
    trends = []
    for i in range(13, -1, -1):
        day = now - timedelta(days=i)
        trends.append({"date": day.strftime("%b %d"), "bugs": 0, "reviews": 0})

    for review in reviews:
        created_at = review.get("created_at")
        if not created_at:
            continue
        try:
            dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except Exception:
            continue
        label = dt.strftime("%b %d")
        for item in trends:
            if item["date"] == label:
                item["reviews"] += 1
                item["bugs"] += len(flags_by_review.get(review["id"], []))
                break

    issue_breakdown = Counter(flag.get("type", "issue") for flag in scoped_flags)
    vulnerabilities = [
        {"name": name.replace("-", " ").title(), "value": value}
        for name, value in issue_breakdown.most_common(6)
    ]

    author_scores = defaultdict(lambda: {"author": "", "clean": 0, "fixed": 0, "unfixed": 0})
    for review in reviews:
        author = review.get("pr_author") or "unknown"
        author_scores[author]["author"] = author
        review_flags = flags_by_review.get(review["id"], [])
        if not review_flags:
            author_scores[author]["clean"] += 1
        for flag in review_flags:
            if flag.get("user_decision") == "safe":
                author_scores[author]["fixed"] += 1
            else:
                author_scores[author]["unfixed"] += 1
    leaderboard = sorted(
        author_scores.values(),
        key=lambda item: item["clean"] + item["fixed"] - item["unfixed"],
        reverse=True,
    )[:8]

    completed = [review for review in reviews if review.get("status") == "completed"]
    critical_count = sum(1 for flag in scoped_flags if flag.get("severity") == "critical")
    clean_reviews = sum(1 for review in reviews if not flags_by_review.get(review["id"], []))
    
    # Calculate historical deltas and average time
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    fourteen_days_ago = now - timedelta(days=14)
    
    current_completed = []
    prior_completed = []
    total_time_mins = 0
    time_reviews = 0
    current_time_mins = 0
    prior_time_mins = 0
    
    for r in completed:
        created_at = r.get("created_at")
        updated_at = r.get("updated_at")
        if not created_at: continue
        try:
            dt_created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            if updated_at:
                dt_updated = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                dur = max(0, (dt_updated - dt_created).total_seconds() / 60.0)
                if dur > 0:
                    total_time_mins += dur
                    time_reviews += 1
            else:
                dur = 0
            
            if dt_created >= seven_days_ago:
                current_completed.append(r)
                if dur > 0: current_time_mins += dur
            elif dt_created >= fourteen_days_ago:
                prior_completed.append(r)
                if dur > 0: prior_time_mins += dur
        except Exception:
            continue

    current_review_ids = {r["id"] for r in current_completed}
    prior_review_ids = {r["id"] for r in prior_completed}
    
    current_flags = [f for f in scoped_flags if f.get("review_id") in current_review_ids]
    prior_flags = [f for f in scoped_flags if f.get("review_id") in prior_review_ids]
    
    current_critical = sum(1 for f in current_flags if f.get("severity") == "critical")
    prior_critical = sum(1 for f in prior_flags if f.get("severity") == "critical")
    
    current_clean = sum(1 for r in current_completed if not flags_by_review.get(r["id"], []))
    prior_clean = sum(1 for r in prior_completed if not flags_by_review.get(r["id"], []))

    avg_time = int(total_time_mins / time_reviews) if time_reviews > 0 else 3
    curr_avg = (current_time_mins / len(current_completed)) if current_completed else avg_time
    prior_avg = (prior_time_mins / len(prior_completed)) if prior_completed else avg_time
    
    stats = {
        "totalReviews": len(completed),
        "criticalIssues": critical_count,
        "autoApproved": clean_reviews,
        "avgReviewTime": avg_time,
        "reviewsChange": len(current_completed) - len(prior_completed),
        "criticalChange": current_critical - prior_critical,
        "approvedChange": current_clean - prior_clean,
        "timeChange": int(curr_avg - prior_avg),
    }

    repo_activity = Counter(review.get("repo_id") for review in reviews if review.get("repo_id"))
    repo_by_id = {repo.get("id"): repo for repo in repos}
    top_repos = []
    for repo_id, count in repo_activity.most_common(5):
        repo = repo_by_id.get(repo_id, {})
        top_repos.append({
            "name": repo.get("full_name") or repo.get("name") or repo_id,
            "reviews": count,
        })

    security_report = build_security_report(None, scoped_flags)
    performance = summarize_performance_findings(scoped_flags)
    quality = calculate_quality_trends(reviews, scoped_flags)

    insights = {
        "topSecurityWin": security_report["audit_summary"],
        "qualityTrend": f"Quality score {quality['latest_quality_score']}/100",
        "securityScore": f"{security_report['compliance_score']}/100 security posture",
        "fastestReview": f"{stats['avgReviewTime']} minutes average",
        "aiSummary": (
            f"PRism reviewed {stats['totalReviews']} pull requests, caught "
            f"{len(scoped_flags)} findings, and kept {stats['criticalIssues']} critical "
            "issue(s) visible before merge."
        ),
        "topRepos": top_repos,
        "performance": performance,
    }

    return {
        "stats": stats,
        "recentReviews": recent_reviews,
        "trends": trends,
        "vulnerabilities": vulnerabilities,
        "leaderboard": leaderboard,
        "insights": insights,
    }
