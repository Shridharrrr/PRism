"""Evidence-based PR insight calculations used by the PRism product surfaces."""

from collections import Counter
from typing import Any


SEVERITY_WEIGHTS = {"critical": 24, "warning": 8, "info": 2}


def calculate_pr_insights(
    review: dict[str, Any],
    flags: list[dict[str, Any]],
    prior_reviews: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create a transparent risk assessment from review findings.

    The score is deliberately derived from recorded findings rather than presented as
    a probabilistic model. That keeps the product explanation honest until enough
    historical data is available to train and validate a prediction model.
    """
    severity_counts = Counter(flag.get("severity", "info") for flag in flags)
    type_counts = Counter(flag.get("type", "issue") for flag in flags)
    affected_files = sorted(
        {flag["file_path"] for flag in flags if flag.get("file_path")}
    )

    weighted_findings = sum(
        SEVERITY_WEIGHTS.get(flag.get("severity"), 2) for flag in flags
    )
    variety_penalty = min(12, max(0, len(type_counts) - 1) * 3)
    file_penalty = min(12, max(0, len(affected_files) - 2) * 2)
    risk_score = min(100, weighted_findings + variety_penalty + file_penalty)

    complexity_score = min(
        100,
        round(
            len(affected_files) * 9
            + len(flags) * 6
            + severity_counts["critical"] * 12
            + severity_counts["warning"] * 4,
            1,
        ),
    )
    estimated_review_time = max(
        2,
        min(90, round(4 + len(affected_files) * 2 + len(flags) * 2.5)),
    )

    prior_reviews = prior_reviews or []
    current_types = set(type_counts)
    similar_pr_ids = []
    for prior_review in prior_reviews:
        prior_types = set(prior_review.get("flag_types", []))
        if current_types and prior_types.intersection(current_types):
            similar_pr_ids.append(prior_review["id"])
        if len(similar_pr_ids) == 5:
            break

    return {
        "review_id": review["id"],
        "risk_score": risk_score,
        "estimated_review_time_minutes": estimated_review_time,
        "complexity_score": complexity_score,
        "change_impact": {
            "affected_files": affected_files,
            "affected_file_count": len(affected_files),
            "finding_types": dict(type_counts),
            "severity_counts": dict(severity_counts),
        },
        "similar_pr_ids": similar_pr_ids,
        "methodology": "Calculated from PRism findings, file breadth, and issue variety.",
    }
