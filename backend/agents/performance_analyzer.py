"""Performance-focused recommendation helpers for PRism."""

from collections import Counter
from typing import Any


PERFORMANCE_TYPES = {
    "performance",
    "n-plus-one",
    "missing-index",
    "memory-leak",
    "bundle-size",
    "algorithmic-complexity",
}


def summarize_performance_findings(flags: list[dict[str, Any]]) -> dict[str, Any]:
    perf_flags = [flag for flag in flags if flag.get("type") in PERFORMANCE_TYPES]
    type_counts = Counter(flag.get("type") for flag in perf_flags)

    return {
        "total_findings": len(perf_flags),
        "breakdown": [
            {"type": issue_type, "count": count}
            for issue_type, count in type_counts.most_common()
        ],
        "recommendations": [
            _recommendation_for_type(issue_type) for issue_type, _ in type_counts.most_common(5)
        ] or ["No performance-specific findings yet. PRism will surface hotspots as reviews run."],
    }


def _recommendation_for_type(issue_type: str) -> str:
    return {
        "n-plus-one": "Add query batching or eager loading where repeated database reads were flagged.",
        "missing-index": "Create an index migration and verify it with query plans before merge.",
        "memory-leak": "Audit subscriptions, timers, and long-lived references around the flagged code path.",
        "bundle-size": "Split large imports and check route-level bundle output before shipping.",
        "algorithmic-complexity": "Replace nested iteration with indexed lookups or streaming transforms.",
        "performance": "Benchmark the flagged path and add a regression guard where possible.",
    }.get(issue_type, f"Investigate recurring {issue_type} performance findings.")
