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