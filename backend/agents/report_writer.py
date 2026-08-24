from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os

async def run_report_writer(
    metadata: dict,
    code_summary: str,
    security_findings: str,
    improvement_suggestions: str
) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    prompt = f"""You are writing a final code review summary for a pull request.

PR: {metadata['title']} by {metadata['author']}

Code Summary:
{code_summary}

Security Findings:
{security_findings}

Improvement Suggestions:
{improvement_suggestions}

Write a concise, professional PR review summary that:
1. States the overall assessment (approve / request changes / needs discussion)
2. Highlights the most critical issues
3. Acknowledges what was done well
4. Lists the top 3 action items for the author

Keep it under 300 words. Be direct and constructive.
"""
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content


async def generate_github_review_summary(
    metadata: dict,
    flags: list,
    review_id: str,
    review_state: str,
    base_url: str = "http://localhost:3000"
) -> str:
    """
    Generate CodeRabbit-style GitHub review summary comment.

    Args:
        metadata: PR metadata (title, author, changed_files, additions, deletions)
        flags: List of parsed flags with severity information
        review_id: Database review ID for linking to full report
        review_state: "APPROVE", "REQUEST_CHANGES", or "COMMENT"
        base_url: Base URL for PRism dashboard links

    Returns:
        Formatted markdown summary for GitHub PR review body
    """

    # Count issues by severity
    critical_count = sum(1 for f in flags if f.get("severity") == "critical")
    warning_count = sum(1 for f in flags if f.get("severity") == "warning")
    info_count = sum(1 for f in flags if f.get("severity") == "info")
    total_issues = len(flags)

    # Count security vs quality issues
    security_count = sum(1 for f in flags if f.get("agent") == "security_auditor")
    quality_count = sum(1 for f in flags if f.get("agent") == "improvement_suggester")

    # Overall assessment
    if review_state == "APPROVE":
        assessment_emoji = "✅"
        assessment_text = "**Approved** - No critical issues found"
    elif review_state == "REQUEST_CHANGES":
        assessment_emoji = "🚨"
        assessment_text = "**Changes Requested** - Critical issues need attention"
    else:
        assessment_emoji = "💬"
        assessment_text = "**Commented** - Review completed with suggestions"

    # Build summary sections
    summary_parts = [
        "## 🛡️ PRism AI Code Review",
        "",
        f"{assessment_emoji} **Overall Assessment:** {assessment_text}",
        "",
        "### 📊 Summary",
        f"- **Files Changed:** {metadata.get('changed_files', 'N/A')}",
        f"- **Lines Added:** +{metadata.get('additions', 0)} / **Removed:** -{metadata.get('deletions', 0)}",
        f"- **Issues Found:** {total_issues}",
    ]

    # Issue breakdown
    if total_issues > 0:
        breakdown = []
        if critical_count > 0:
            breakdown.append(f"🚨 {critical_count} critical")
        if warning_count > 0:
            breakdown.append(f"⚠️ {warning_count} warnings")
        if info_count > 0:
            breakdown.append(f"💡 {info_count} suggestions")

        summary_parts.append(f"  - {', '.join(breakdown)}")

        if security_count > 0 or quality_count > 0:
            category_breakdown = []
            if security_count > 0:
                category_breakdown.append(f"🔒 {security_count} security")
            if quality_count > 0:
                category_breakdown.append(f"✨ {quality_count} code quality")
            summary_parts.append(f"  - {', '.join(category_breakdown)}")

    summary_parts.append("")

    # Key findings (top 3 critical/warnings)
    critical_flags = [f for f in flags if f.get("severity") == "critical"]
    warning_flags = [f for f in flags if f.get("severity") == "warning"]
    key_flags = (critical_flags + warning_flags)[:3]

    if key_flags:
        summary_parts.extend([
            "### 🎯 Key Findings",
            ""
        ])
        for flag in key_flags:
            flag_type = flag.get("type", "issue").replace("-", " ").replace("_", " ").title()
            severity = flag.get("severity", "info")
            emoji = "🚨" if severity == "critical" else "⚠️"
            file_path = flag.get("file_path", "unknown file")
            line = flag.get("line_start")
            location = f"`{file_path}:{line}`" if line else f"`{file_path}`"

            summary_parts.append(f"- {emoji} **{flag_type}** in {location}")
        summary_parts.append("")

    # Positive feedback if no critical issues
    if critical_count == 0:
        summary_parts.extend([
            "### ✅ What Looks Good",
            ""
        ])

        if total_issues == 0:
            summary_parts.append("- Clean code with no significant issues detected")
            summary_parts.append("- Good adherence to security best practices")
        elif warning_count > 0 or info_count > 0:
            summary_parts.append("- No critical security vulnerabilities found")
            summary_parts.append("- Code structure appears sound")

        summary_parts.append("")

    # Footer with help text and link
    summary_parts.extend([
        "---",
        "💡 **Need clarification?** Reply to any comment and I'll help explain or provide alternative solutions.",
        "",
        f"📊 [View Full Report]({base_url}/reviews/{review_id}) • Powered by **PRism AI**"
    ])

    return "\n".join(summary_parts)