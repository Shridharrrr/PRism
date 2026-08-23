from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os

async def run_security_auditor(diff: str, code_summary: str, metadata: dict = {}) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.1,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    prompt = f"""You are a security engineer reviewing a pull request for vulnerabilities.

Code summary from senior engineer:
{code_summary}

Analyze this diff for security issues. For each issue found, provide:
- SEVERITY: (critical / warning / info)
- TYPE: (e.g. sql-injection, xss, hardcoded-secret, insecure-dependency, auth-bypass, data-exposure)
- FILE: the affected file path
- LINE: approximate line number if visible
- DESCRIPTION: what the vulnerability is
- SUGGESTION: how to fix it

{metadata.get('prism_config', '')}

If no security issues found, say "No security issues detected."

Format each finding as:
[SEVERITY] TYPE | FILE:LINE
Description
Suggestion

Diff:
{diff[:8000]}
"""
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content