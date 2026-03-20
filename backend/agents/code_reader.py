from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os

async def run_code_reader(diff: str, metadata: dict) -> str:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    prompt = f"""You are a senior software engineer doing a code review.

PR Title: {metadata['title']}
Author: {metadata['author']}
Base branch: {metadata['base_branch']}
Changed files: {metadata['changed_files']}
Additions: {metadata['additions']} | Deletions: {metadata['deletions']}

Analyze this diff and provide:
1. A clear summary of what this PR does
2. Which files/areas are affected
3. The overall intent and approach
4. Any immediate concerns about the implementation

Diff:
{diff[:8000]}
"""
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content