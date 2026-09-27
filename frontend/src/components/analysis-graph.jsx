"use client";

import { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  GitPullRequest,
  FileJson,
  ShieldAlert,
  FileCode,
  Search,
  FileText,
  CheckCircle2,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

// Map string icon names to Lucide components
const icons = {
  GitPullRequest,
  FileJson,
  ShieldAlert,
  FileCode,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
};

// ─── CUSTOM NODE ─────────────────────────────────────────────────────────────

function AgentNode({ data }) {
  const Icon = icons[data.iconName] || Search;
  const isAnalyzing = data.status === "analyzing";
  const isCompleted = data.status === "completed";
  const isFailed = data.status === "failed";

  let statusColor = "text-muted-foreground";
  let borderColor = "border-border/60";
  let bgColor = "bg-card/40";

  if (isAnalyzing) {
    statusColor = "text-primary";
    borderColor =
      "border-primary/50 shadow-[0_0_20px_oklch(var(--color-primary)/0.15)]";
    bgColor = "bg-primary/5";
  } else if (isCompleted) {
    statusColor = "text-green-400";
    borderColor = "border-green-500/30";
    bgColor = "bg-green-500/5";
  } else if (isFailed) {
    statusColor = "text-red-400";
    borderColor = "border-red-500/40";
    bgColor = "bg-red-500/5";
  }

  return (
    <div
      className={`px-4 py-3 rounded-xl border backdrop-blur-md min-w-[200px] transition-all duration-500 ${borderColor} ${bgColor}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 !bg-primary/50 !border-0 opacity-0"
      />
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-background/60 border border-border/50 shadow-sm ${statusColor}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {data.label}
          </span>
          {data.subtext && (
            <span className="text-xs text-muted-foreground truncate mt-0.5">
              {data.subtext}
            </span>
          )}
        </div>
        <div className="ml-2 shrink-0">
          {isAnalyzing && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-primary/50 !border-0 opacity-0"
      />
    </div>
  );
}

const nodeTypes = { agent: AgentNode };

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function AnalysisGraph({ review, flags = [] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Calculate stats for nodes
  const secFlags = flags.filter((f) => f.agent === "security_auditor").length;
  const qualFlags = flags.filter(
    (f) => f.agent === "improvement_suggester",
  ).length;

  useEffect(() => {
    if (!review) return;

    const s = review.status; // 'queued', 'analyzing', 'completed', 'failed'

    // Determine individual node statuses based on overall pipeline state
    const st = {
      trigger: s !== "queued" ? "completed" : "analyzing",
      diff:
        s === "completed" || s === "failed"
          ? "completed"
          : s === "analyzing"
            ? "completed"
            : "pending",
      agents:
        s === "completed"
          ? "completed"
          : s === "analyzing"
            ? "analyzing"
            : "pending",
      report:
        s === "completed"
          ? "completed"
          : s === "analyzing"
            ? "pending"
            : "pending",
      result: s === "completed" ? "completed" : "pending",
    };

    if (s === "failed") {
      st.agents = "failed";
      st.report = "failed";
      st.result = "failed";
    }

    const newNodes = [
      {
        id: "trigger",
        type: "agent",
        position: { x: 300, y: 0 },
        data: {
          label: "PR Triggered",
          subtext: `#${review.pr_number} by ${review.pr_author}`,
          iconName: "GitPullRequest",
          status: st.trigger,
        },
      },
      {
        id: "diff",
        type: "agent",
        position: { x: 300, y: 120 },
        data: {
          label: "Diff Extractor",
          subtext: "Fetching changed files",
          iconName: "FileJson",
          status: st.diff,
        },
      },
      {
        id: "sec_agent",
        type: "agent",
        position: { x: 0, y: 260 },
        data: {
          label: "Security Auditor",
          subtext:
            st.agents === "completed"
              ? `${secFlags} issues found`
              : "Scanning for vulns",
          iconName: "ShieldAlert",
          status: st.agents,
        },
      },
      {
        id: "qual_agent",
        type: "agent",
        position: { x: 300, y: 260 },
        data: {
          label: "Quality Inspector",
          subtext:
            st.agents === "completed"
              ? `${qualFlags} suggestions`
              : "Checking code smells",
          iconName: "FileCode",
          status: st.agents,
        },
      },
      {
        id: "style_agent",
        type: "agent",
        position: { x: 600, y: 260 },
        data: {
          label: "Static Analyzer",
          subtext: st.agents === "completed" ? "Clean" : "Linting syntax",
          iconName: "AlertTriangle",
          status: st.agents,
        },
      },
      {
        id: "report",
        type: "agent",
        position: { x: 300, y: 400 },
        data: {
          label: "Report Synthesizer",
          subtext: "Compiling feedback",
          iconName: "FileText",
          status: st.report,
        },
      },
      {
        id: "result",
        type: "agent",
        position: { x: 300, y: 520 },
        data: {
          label: "Review Complete",
          subtext: s === "completed" ? `${flags.length} total flags` : "",
          iconName: "CheckCircle2",
          status: st.result,
        },
      },
    ];

    const edgeStyle = {
      stroke: "rgba(129, 140, 248, 0.4)",
      strokeWidth: 2,
    };

    const activeEdgeStyle = {
      stroke: "rgba(129, 140, 248, 1)",
      strokeWidth: 2,
    };

    const markerEnd = {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: "rgba(129, 140, 248, 0.4)",
    };

    const activeMarkerEnd = {
      ...markerEnd,
      color: "rgba(129, 140, 248, 1)",
    };

    const isAnim = s === "analyzing";

    const newEdges = [
      {
        id: "e1",
        source: "trigger",
        target: "diff",
        type: "smoothstep",
        animated: isAnim && st.diff === "completed",
        style: st.diff === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.diff === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e2",
        source: "diff",
        target: "sec_agent",
        type: "smoothstep",
        animated: isAnim,
        style: st.agents === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.agents === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e3",
        source: "diff",
        target: "qual_agent",
        type: "smoothstep",
        animated: isAnim,
        style: st.agents === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.agents === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e4",
        source: "diff",
        target: "style_agent",
        type: "smoothstep",
        animated: isAnim,
        style: st.agents === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.agents === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e5",
        source: "sec_agent",
        target: "report",
        type: "smoothstep",
        animated: isAnim && st.agents === "completed",
        style: st.report === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.report === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e6",
        source: "qual_agent",
        target: "report",
        type: "smoothstep",
        animated: isAnim && st.agents === "completed",
        style: st.report === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.report === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e7",
        source: "style_agent",
        target: "report",
        type: "smoothstep",
        animated: isAnim && st.agents === "completed",
        style: st.report === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.report === "completed" ? activeMarkerEnd : markerEnd,
      },
      {
        id: "e8",
        source: "report",
        target: "result",
        type: "smoothstep",
        animated: false,
        style: st.result === "completed" ? activeEdgeStyle : edgeStyle,
        markerEnd: st.result === "completed" ? activeMarkerEnd : markerEnd,
      },
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [review, flags, qualFlags, secFlags, setNodes, setEdges]);

  return (
    <div className="w-full h-[60vh] min-h-[550px] rounded-2xl border border-border/60 bg-card/20 overflow-hidden relative shadow-lg shadow-primary/5">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="rgba(129, 140, 248, 0.15)" gap={16} size={1} />
        <Controls
          className="!bg-card !border-border/60 !shadow-lg !rounded-lg overflow-hidden [&>button]:!border-b-border/60 [&>button]:!bg-transparent [&>button]:hover:!bg-primary/10 [&>button>svg]:!fill-foreground"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Overlay gradient to blend edges */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-border/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
            {review?.status === "analyzing" ? (
              <>
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                Pipeline is analyzing the repo
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                Pipeline queued for analysis
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
