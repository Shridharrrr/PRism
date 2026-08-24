"""Technical debt and repository quality calculations for PRism."""

from collections import Counter, defaultdict
from typing import Any


DEBT_WEIGHTS = {
    "complexity": 10,
    "duplication": 12,
    "missing-tests": 9,
    "performance": 8,
    "readability": 5,
    "naming": 3,
}


def calculate_quality_trends(reviews: list[dict[str, Any]], flags: list[dict[str, Any]]) -> dict[str, Any]:
    by_review = defaultdict(list)
    for flag in flags:
        by_review[flag.get("review_id")].append(flag)

    ordered_reviews = sorted(reviews, key=lambda item: item.get("created_at") or "")[-30:]
    trend = []
    file_heat = Counter()
    debt_total = 0

    for review in ordered_reviews:
        review_flags = by_review.get(review.get("id"), [])
        score_penalty = 0
        for flag in review_flags:
            flag_type = flag.get("type", "issue")
            severity = flag.get("severity")
            score_penalty += DEBT_WEIGHTS.get(flag_type, 4)
            if severity == "critical":
                score_penalty += 10
            elif severity == "warning":
                score_penalty += 4
            if flag.get("file_path"):
                file_heat[flag["file_path"]] += DEBT_WEIGHTS.get(flag_type, 4)

        quality_score = max(0, min(100, 100 - score_penalty))
        debt_score = max(0, min(100, score_penalty))
        debt_total += debt_score
        trend.append({
            "review_id": review.get("id"),
            "date": review.get("created_at"),
            "quality_score": quality_score,
            "tech_debt_score": debt_score,
            "issue_count": len(review_flags),
        })

    top_hotspots = [
        {"file_path": file_path, "debt_score": score}
        for file_path, score in file_heat.most_common(10)
    ]

    latest_score = trend[-1]["quality_score"] if trend else 100
    average_debt = round(debt_total / len(trend), 1) if trend else 0

    return {
        "latest_quality_score": latest_score,
        "average_tech_debt_score": average_debt,
        "trend": trend,
        "hotspots": top_hotspots,
        "recommendations": _build_recommendations(top_hotspots, flags),
    }


def _build_recommendations(hotspots: list[dict[str, Any]], flags: list[dict[str, Any]]) -> list[str]:
    if not hotspots:
        return ["No recurring debt hotspots yet. Keep reviews enabled to build trend history."]

    recommendations = []
    top_file = hotspots[0]["file_path"]
    recommendations.append(f"Prioritize a focused cleanup pass on {top_file}; it has the highest accumulated review debt.")

    type_counts = Counter(flag.get("type", "issue") for flag in flags)
    if type_counts:
        top_type, _ = type_counts.most_common(1)[0]
        recommendations.append(f"Add a checklist item for recurring {top_type} findings before merge.")

    recommendations.append("Track quality score after each review to confirm refactors are reducing repeated findings.")
    return recommendations
