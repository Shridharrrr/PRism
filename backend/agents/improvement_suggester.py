from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os

async def run_improvement_suggester(diff: str, code_summary: str, metadata: dict = {}) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    prompt = f"""You are a senior engineer focused on code quality and best practices.

Code summary:
{code_summary}

Review this diff for improvements. For each issue found provide:
- SEVERITY: (warning / info)
- TYPE: (e.g. complexity, duplication, naming, missing-tests, performance, readability)
- FILE: the affected file path
- LINE: approximate line number if visible
- DESCRIPTION: what the issue is
- SUGGESTION: concrete improvement

{metadata.get('prism_config', '')}

Format each finding as:
[SEVERITY] TYPE | FILE:LINE
Description
Suggestion

Diff:
{diff[:8000]}
"""
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content