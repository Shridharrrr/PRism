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
        model="gemini-2.5-flash",
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