"use client";

import { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  GitPullRequest,
  Check,
  CornerDownRight,
  Code2,
  MessageSquare,
  Bot,
  User,
  Zap,
} from "lucide-react";

export function HeroDemoPreview() {
  const [activeTab, setActiveTab] = useState("security");
  const [isFixApplied, setIsFixApplied] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/60 overflow-hidden text-left transition-all duration-300">
      {/* ── Window Header ── */}
      <div className="px-4 py-3 border-b border-border/60 bg-muted/40 flex flex-wrap items-center justify-between gap-3">
        {/* macOS dots + PR title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-border/80 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <GitPullRequest className="w-3.5 h-3.5 text-foreground" />
            <span className="font-semibold text-foreground">PR #142</span>
            <span className="hidden sm:inline text-muted-foreground/60">/</span>
            <span className="hidden sm:inline truncate max-w-[200px] md:max-w-none">
              feat(auth): validate session token & user query
            </span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {isFixApplied ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-fade-up">
              <CheckCircle2 className="w-3 h-3" />
              <span>All Checks Passed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>1 Flag Requires Review</span>
            </span>
          )}
          <span className="hidden md:inline-flex text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
            1.2s review
          </span>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="px-4 py-2 border-b border-border/40 bg-muted/20 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "security"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Vulnerability Detection</span>
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "architecture"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Architecture & Perf</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-background text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
            <span>AI Discussion Thread</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <span>file:</span>
          <span className="text-foreground font-semibold">src/api/users.ts</span>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="p-4 sm:p-6 bg-card/40">
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* Diff Preview */}
            <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden font-mono text-xs sm:text-[13px] leading-relaxed">
              <div className="px-4 py-2 border-b border-border/40 bg-muted/60 text-muted-foreground flex items-center justify-between text-[11px]">
                <span>@@ -42,7 +42,7 @@ async function getUser(req, res)</span>
                <span className="text-muted-foreground/80">TypeScript</span>
              </div>
              <div className="p-3 sm:p-4 overflow-x-auto space-y-1">
                <div className="text-muted-foreground select-none">
                  {"  "}const {"{ userId }"} = req.params;
                </div>
                {!isFixApplied ? (
                  <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-1 -mx-2 rounded flex items-center gap-2">
                    <span className="select-none font-bold text-rose-500">-</span>
                    <code>{"const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);"}</code>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 -mx-2 rounded flex items-center gap-2 animate-fade-up">
                    <span className="select-none font-bold text-emerald-500">+</span>
                    <code>{"const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);"}</code>
                  </div>
                )}
                <div className="text-muted-foreground select-none">
                  {"  "}return res.json({"{"} success: true, user {"}"});
                </div>
              </div>
            </div>

            {/* AI Review Bot Card */}
            <div className="rounded-xl border border-rose-500/30 dark:border-rose-500/20 bg-background/95 p-4 sm:p-5 shadow-lg relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-foreground">
                        PRism Security Auditor
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                        CRITICAL • CWE-89
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Confidence: 99.4%
                </span>
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-4">
                <strong>SQL Injection vulnerability detected:</strong> Direct template literal concatenation of unsanitized route parameter <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">userId</code> allows malicious actors to manipulate SQL queries.
              </p>

              {/* Action bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Suggested fix: Use parameterized query</span>
                </div>

                <button
                  onClick={() => setIsFixApplied(!isFixApplied)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
                    isFixApplied
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {isFixApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Fix Applied • Clean PR</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply 1-Click Fix</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 font-mono text-xs sm:text-sm text-muted-foreground space-y-2">
              <div className="flex items-center justify-between text-xs text-foreground font-semibold">
                <span>src/services/billing.ts</span>
                <span className="text-amber-500 font-mono text-xs">N+1 Query Detected</span>
              </div>
              <div className="p-3 bg-background/80 rounded-lg border border-border/40 text-xs">
                <code>
                  for (const order of orders) &#123;
                  <br />
                  &nbsp;&nbsp;await fetchPaymentStatus(order.id); // ⚠️ 48 roundtrips
                  <br />
                  &#125;
                </code>
              </div>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-background/95 p-4 sm:p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-foreground">
                  PRism Architecture Inspector
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Performance Risk
                </span>
              </div>
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                Sequential async await inside iteration loop will result in linear latency degradation under load. Batch fetch records using <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">fetchPaymentBatch(orderIds)</code> to reduce database trips from 48 to 1.
              </p>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-3 font-sans">
            {/* User message */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">shridhar (Author)</span>
                  <span className="text-[10px] text-muted-foreground">3m ago</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90">
                  @prism-bot can this SQL injection be reached by unauthenticated external requests?
                </p>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background border border-border shadow-xs">
              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0 font-bold text-xs">
                P
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">PRism AI</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-500 border border-sky-500/20">
                    Agent
                  </span>
                  <span className="text-[10px] text-muted-foreground">just now</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  Yes. Inspection of <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">src/routes/api.ts:24</code> shows this route is registered without the <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">requireAuth</code> middleware, making it accessible to any unauthenticated caller. Applying the suggested parameterized query completely mitigates this hazard.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Window Footer ── */}
      <div className="px-4 py-2.5 border-t border-border/60 bg-muted/30 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            AST + Semantic Multi-Agent Graph
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Repo rules: .prism.yaml</span>
        </div>
        <div className="font-mono text-muted-foreground/80">
          GitHub Checks API integration
        </div>
      </div>
    </div>
  );
}
