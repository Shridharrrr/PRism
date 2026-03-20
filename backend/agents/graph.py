import asyncio
from typing import TypedDict
from langgraph.graph import StateGraph, END
from agents.code_reader import run_code_reader
from agents.security_auditor import run_security_auditor
from agents.improvement_suggester import run_improvement_suggester
from agents.report_writer import run_report_writer

class PRismState(TypedDict):
    diff: str
    metadata: dict
    code_summary: str
    security_findings: str
    improvement_suggestions: str
    final_report: str

async def code_reader_node(state: PRismState) -> dict:
    result = await run_code_reader(state["diff"], state["metadata"])
    return {"code_summary": result}

async def parallel_analysis_node(state: PRismState) -> dict:
    security, improvements = await asyncio.gather(
        run_security_auditor(state["diff"], state["code_summary"]),
        run_improvement_suggester(state["diff"], state["code_summary"])
    )
    return {
        "security_findings": security,
        "improvement_suggestions": improvements
    }

async def report_writer_node(state: PRismState) -> dict:
    result = await run_report_writer(
        state["metadata"],
        state["code_summary"],
        state["security_findings"],
        state["improvement_suggestions"]
    )
    return {"final_report": result}

def build_graph():
    graph = StateGraph(PRismState)

    graph.add_node("code_reader", code_reader_node)
    graph.add_node("parallel_analysis", parallel_analysis_node)
    graph.add_node("report_writer", report_writer_node)

    graph.set_entry_point("code_reader")
    graph.add_edge("code_reader", "parallel_analysis")
    graph.add_edge("parallel_analysis", "report_writer")
    graph.add_edge("report_writer", END)

    return graph.compile()

prism_graph = build_graph()