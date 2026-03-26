"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X, FileCode } from "lucide-react";

const severityConfig = {
  critical: {
    badge: "bg-red-500/15 text-red-400 border border-red-500/25",
    border: "border-l-2 border-l-red-500",
    cardBorder: "border-red-500/20",
  },
  warning: {
    badge: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
    border: "border-l-2 border-l-amber-400",
    cardBorder: "border-amber-500/20",
  },
  info: {
    badge: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
    border: "border-l-2 border-l-blue-400",
    cardBorder: "border-blue-500/20",
  },
};

const agentLabels = {
  security_auditor: "Security",
  improvement_suggester: "Quality",
};

export function FlagCard({ flag }) {
  const [decision, setDecision] = useState(flag.user_decision);
  const [loading, setLoading] = useState(null);
  const [expanded, setExpanded] = useState(!flag.user_decision);
  const styles = severityConfig[flag.severity] ?? severityConfig.info;

  const decide = async (value) => {
    setLoading(value);
    await fetch(`http://localhost:8000/api/flags/${flag.id}/decision`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: value }),
    });
    setDecision(value);
    setLoading(null);
    if (value) setExpanded(false);
  };

  return (
    <div
      className={`rounded-xl border bg-card/60 overflow-hidden transition-all duration-200 ${styles.border} ${styles.cardBorder} ${decision ? "opacity-60" : ""}`}
    >
      {/* Card header - always visible, click to expand/collapse */}
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-accent/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${styles.badge}`}
            >
              {flag.severity}
            </span>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full shrink-0">
              {agentLabels[flag.agent] ?? flag.agent}
            </span>
            {flag.type && (
              <span className="text-xs text-muted-foreground font-mono shrink-0">
                {flag.type}
              </span>
            )}

            {decision && (
              <span
                className={`text-xs font-medium ml-auto shrink-0 flex items-center gap-1 ${
                  decision === "safe" ? "text-green-400" : "text-red-400"
                }`}
              >
                {decision === "safe" ? (
                  <>
                    <Check className="w-3 h-3" /> Marked safe
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" /> Issue confirmed
                  </>
                )}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground/90 text-left leading-relaxed line-clamp-2">
            {flag.description}
          </p>

          {(flag.file_path || flag.line_start) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <FileCode className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {flag.file_path}
                {flag.line_start && `:${flag.line_start}`}
                {flag.line_end && flag.line_end !== flag.line_start
                  ? `\u2013${flag.line_end}`
                  : ""}
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0 text-muted-foreground mt-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expandable details */}
      {expanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border/40">
          {/* Full description */}
          <p className="text-sm text-foreground/80 leading-relaxed pt-4">
            {flag.description}
          </p>

          {/* Code snippet */}
          {flag.snippet && (
            <div className="rounded-lg overflow-hidden border border-border/50">
              <div className="flex items-center gap-2 px-3 py-2 bg-background/60 border-b border-border/50">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {flag.file_path ?? "snippet"}
                  {flag.line_start && `:${flag.line_start}`}
                </span>
              </div>
              <pre className="text-xs bg-background/40 p-4 overflow-x-auto font-mono whitespace-pre-wrap text-foreground/80 leading-relaxed">
                {flag.snippet}
              </pre>
            </div>
          )}

          {/* Suggestion */}
          {flag.suggestion && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-1.5">
                Suggestion
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {flag.suggestion}
              </p>
            </div>
          )}

          {/* Action buttons */}
          {!decision && (
            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                onClick={() => decide("safe")}
                disabled={!!loading}
              >
                <Check className="w-4 h-4" />
                {loading === "safe" ? "Saving..." : "Mark safe"}
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                onClick={() => decide("confirmed")}
                disabled={!!loading}
              >
                <X className="w-4 h-4" />
                {loading === "confirmed" ? "Saving..." : "Confirm issue"}
              </button>
            </div>
          )}

          {/* Undo decision */}
          {decision && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
              onClick={() => {
                setDecision(null);
                setExpanded(true);
              }}
            >
              Change decision
            </button>
          )}
        </div>
      )}
    </div>
  );
}
