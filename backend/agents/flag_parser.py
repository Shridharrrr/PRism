from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
import json
import re

async def parse_flags_from_outputs(
    review_id: str,
    code_summary: str,
    security_findings: str,
    improvement_suggestions: str,
) -> list:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    prompt = f"""You are extracting structured findings from a code review.

Below are outputs from two review agents. Extract every distinct issue as a JSON array.

SECURITY FINDINGS:
{security_findings}

IMPROVEMENT SUGGESTIONS:
{improvement_suggestions}

CODE CONTEXT (for snippet extraction):
{code_summary[:2000]}

Return ONLY a valid JSON array, no markdown, no explanation. Each item must have:
- "type": string (e.g. "sql-injection", "hardcoded-secret", "complexity", "naming", "missing-tests")
- "severity": exactly one of "critical", "warning", "info"
- "agent": exactly one of "security_auditor", "improvement_suggester"
- "file_path": string or null
- "line_start": integer or null
- "line_end": integer or null
- "description": string (what the issue is)
- "suggestion": string (how to fix it)
- "snippet": string or null (the relevant code snippet if mentioned)

Example:
[
  {{
    "type": "hardcoded-secret",
    "severity": "critical",
    "agent": "security_auditor",
    "file_path": "src/config.js",
    "line_start": 12,
    "line_end": 12,
    "description": "API key hardcoded in source file",
    "suggestion": "Move to environment variables",
    "snippet": "const API_KEY = 'sk-abc123...'"
  }}
]
"""

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    raw = response.content.strip()

    # Strip markdown code fences if present
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    try:
        flags = json.loads(raw)

        # Sanitize — only keep columns that exist in the table
        allowed_keys = {
            "review_id", "type", "severity", "agent",
            "file_path", "line_start", "line_end",
            "description", "suggestion", "snippet"
        }
        cleaned = []
        for flag in flags:
            flag["review_id"] = review_id
            cleaned.append({k: v for k, v in flag.items() if k in allowed_keys})

        return cleaned

    except json.JSONDecodeError:
        print(f"Flag parser JSON error. Raw output: {raw[:500]}")
        return []


async def generate_review_comments_from_flags(flags: list, config: dict = None) -> list:
    """
    Convert flags into conversational GitHub review comments.
    CodeRabbit-style with explanations, code suggestions, and helpful tone.

    Args:
        flags: List of flag dictionaries with type, severity, description, suggestion, etc.
        config: Optional .prism.yaml config for tone customization

    Returns:
        List of review comment dictionaries with path, line, body
    """
    if config is None:
        config = {}

    tone = config.get("review", {}).get("tone", "professional")
    include_code_suggestions = config.get("review", {}).get("include_code_suggestions", True)
    include_explanations = config.get("review", {}).get("include_explanations", True)

    review_comments = []

    for flag in flags:
        # Skip if no file path or line number
        if not flag.get("file_path") or not flag.get("line_start"):
            continue

        # Build conversational comment
        severity = flag.get("severity", "info")
        flag_type = flag.get("type", "issue")
        description = flag.get("description", "")
        suggestion = flag.get("suggestion", "")
        snippet = flag.get("snippet")

        # Emoji mapping
        emoji_map = {
            "critical": "🚨",
            "warning": "⚠️",
            "info": "💡"
        }
        emoji = emoji_map.get(severity, "📝")

        # Title
        severity_label = severity.upper() if severity == "critical" else severity.capitalize()
        title = f"{emoji} **{severity_label}**: {flag_type.replace('-', ' ').replace('_', ' ').title()}"

        # Body parts
        body_parts = [title, ""]

        # Description
        body_parts.append(description)

        # Code snippet if available
        if snippet and include_code_suggestions:
            body_parts.append("")
            body_parts.append("**Current code:**")
            body_parts.append("```")
            body_parts.append(snippet.strip())
            body_parts.append("```")

        # Suggestion
        if suggestion and include_code_suggestions:
            body_parts.append("")
            body_parts.append("**Suggested fix:**")
            body_parts.append(suggestion)

        # Explanation for critical issues
        if include_explanations and severity == "critical":
            body_parts.append("")
            explanations = {
                "sql-injection": "**Why this matters:** SQL injection vulnerabilities allow attackers to manipulate database queries, potentially leading to unauthorized data access, modification, or deletion.",
                "xss": "**Why this matters:** Cross-site scripting (XSS) allows attackers to inject malicious scripts that execute in other users' browsers, potentially stealing credentials or session tokens.",
                "hardcoded-secret": "**Why this matters:** Hardcoded secrets in source code are visible to anyone with repository access and remain in git history even after removal.",
                "path-traversal": "**Why this matters:** Path traversal vulnerabilities allow attackers to access files outside the intended directory, potentially exposing sensitive configuration or system files.",
                "command-injection": "**Why this matters:** Command injection allows attackers to execute arbitrary system commands, potentially compromising the entire server.",
            }
            if flag_type in explanations:
                body_parts.append(explanations[flag_type])

        # Tone adjustment
        if tone == "friendly":
            footer = "\n---\n💬 **Questions?** Feel free to ask, and I'll help clarify or suggest alternatives!"
        elif tone == "concise":
            # Skip explanations in concise mode
            body_parts = [part for part in body_parts if not part.startswith("**Why this matters:**")]
            footer = ""
        else:  # professional
            footer = "\n---\n💡 **Need clarification?** Reply to this comment, and I'll provide more details or alternative approaches."

        if footer:
            body_parts.append(footer)

        # Assemble final comment
        comment_body = "\n".join(body_parts)

        review_comments.append({
            "path": flag["file_path"],
            "line": flag["line_start"],
            "body": comment_body,
            "severity": severity
        })

    return review_comments