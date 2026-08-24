"""Security posture and compliance mapping helpers for PRism."""

from collections import Counter
from typing import Any


OWASP_MAP = {
    "sql-injection": "A03: Injection",
    "xss": "A03: Injection",
    "auth-bypass": "A01: Broken Access Control",
    "data-exposure": "A02: Cryptographic Failures",
    "hardcoded-secret": "A07: Identification and Authentication Failures",
    "insecure-dependency": "A06: Vulnerable and Outdated Components",
}


def build_security_report(repo: dict[str, Any] | None, flags: list[dict[str, Any]]) -> dict[str, Any]:
    security_flags = [
        flag for flag in flags
        if flag.get("agent") == "security_auditor" or flag.get("type") in OWASP_MAP
    ]
    owasp_counts = Counter(
        OWASP_MAP.get(flag.get("type"), "Unmapped security finding")
        for flag in security_flags
    )
    critical = sum(1 for flag in security_flags if flag.get("severity") == "critical")
    warnings = sum(1 for flag in security_flags if flag.get("severity") == "warning")
    compliance_score = max(0, 100 - critical * 18 - warnings * 6 - max(0, len(security_flags) - 5) * 2)

    return {
        "repo_id": repo.get("id") if repo else None,
        "repo_name": repo.get("full_name") or repo.get("name") if repo else None,
        "compliance_score": compliance_score,
        "critical_findings": critical,
        "warning_findings": warnings,
        "owasp_breakdown": [
            {"category": category, "count": count}
            for category, count in owasp_counts.most_common()
        ],
        "audit_summary": _audit_summary(compliance_score, critical, warnings),
        "controls": [
            {"name": "OWASP Top 10 mapping", "status": "active"},
            {"name": "Secret exposure detection", "status": "active"},
            {"name": "Dependency vulnerability review", "status": "active"},
            {"name": "Compliance export", "status": "ready"},
        ],
    }


def _audit_summary(score: int, critical: int, warnings: int) -> str:
    if critical:
        return f"Needs attention: {critical} critical security finding(s) require remediation before audit-ready status."
    if warnings:
        return f"Healthy posture with {warnings} warning-level item(s) to track before the next release."
    if score >= 95:
        return "Excellent posture. No active PRism security findings in the selected scope."
    return "Security posture is stable; keep automated reviews enabled for every PR."
