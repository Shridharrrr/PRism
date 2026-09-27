"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  MessageSquare,
  Sliders,
  CheckCircle2,
  Check,
  TrendingDown,
  Cpu,
} from "lucide-react";

export function BentoFeatures() {
  const [config, setConfig] = useState({
    strictSecurity: true,
    autoApproveClean: true,
  });

  const [chatStep, setChatStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setChatStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const chatMessages = [
    {
      q: "Can this SQL query be parameterized?",
      a: "Yes. Refactored into a prepared statement with positional parameters ($1, $2).",
    },
    {
      q: "Why was this cookie flagged as insecure?",
      a: "Missing `secure: true` and `httpOnly: true` flags, leaving session tokens vulnerable to XSS.",
    },
    {
      q: "Does this affect our API response latency?",
      a: "No. Replacing sequential DB calls with DataLoader reduced roundtrips from 12 to 1.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {/* ── CARD 1: Security Auditor ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Security Auditor
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Autonomous static and semantic inspection detecting SQL injection, hardcoded secrets, and auth bypasses.
          </p>
        </div>

        {/* Micro-UI: Terminal Scanner */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2.5 font-mono text-[11px] text-foreground">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border pb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>ast.scanner.active</span>
            </span>
            <span className="font-mono">0 False Positives</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between bg-card px-2.5 py-1.5 rounded border border-border">
              <span className="font-medium text-foreground">CWE-89 SQLi</span>
              <span className="text-muted-foreground text-[10px]">user_id route param</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground px-1">
              <Check className="w-3 h-3 shrink-0 text-foreground" />
              <span>Auto-remediated via prepared statement</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Architecture & Performance ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Architecture &amp; Performance
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Surfaces unindexed database lookups, blocking async loops, and memory leak vectors before merge.
          </p>
        </div>

        {/* Micro-UI: Latency Delta Benchmark */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2.5 font-mono text-[11px] text-foreground">
          <div className="flex items-center justify-between text-[10px] border-b border-border pb-2 text-muted-foreground">
            <span>Query Latency Delta</span>
            <span className="inline-flex items-center gap-1 text-foreground font-mono font-medium">
              <TrendingDown className="w-3 h-3" />
              -94%
            </span>
          </div>

          <div className="space-y-2 pt-0.5">
            <div className="bg-card p-2 rounded border border-border">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Before (N+1 queries)</span>
                <span className="font-mono text-foreground">480ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-muted-foreground/60 w-[85%] rounded-full" />
              </div>
            </div>

            <div className="bg-card p-2 rounded border border-border">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>PRism Batch Suggestion</span>
                <span className="font-mono text-foreground font-medium">28ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-foreground w-[12%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 3: Conversational PR Threads ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Conversational GitHub Threads
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Reply directly to review comments on GitHub to ask questions, request alternatives, or clarify rationale.
          </p>
        </div>

        {/* Micro-UI: Minimal GitHub Comment Thread */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 text-[11px] font-sans">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border font-mono">
            <span>github.com // pr comment thread</span>
            <span className="text-foreground font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>Live bot reply</span>
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="bg-card p-2.5 rounded border border-border space-y-1">
              <span className="text-[10px] text-muted-foreground font-mono block font-medium">@engineer:</span>
              <p className="text-foreground text-[11px] font-normal leading-snug">
                {chatMessages[chatStep].q}
              </p>
            </div>
            <div className="bg-card p-2.5 rounded border border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground font-mono font-medium">PRism AI [bot]:</span>
                <span className="text-[9px] font-mono text-muted-foreground">2s response</span>
              </div>
              <p className="text-foreground/90 text-[11px] font-normal leading-snug">
                {chatMessages[chatStep].a}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: Interactive Policy Rules ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Sliders className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Repository Policy as Code
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Configure rules, ignore patterns, and severity gates via a version-controlled <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono text-foreground">.prism.yaml</code> in your repo.
          </p>
        </div>

        {/* Micro-UI: Interactive Config Toggles */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 font-mono text-[11px] text-foreground">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border pb-2">
            <span>.prism.yaml</span>
            <span className="text-muted-foreground text-[10px]">Click to toggle</span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  strictSecurity: !prev.strictSecurity,
                }))
              }
              className="w-full flex items-center justify-between p-1.5 rounded bg-card hover:bg-muted border border-border transition-colors text-left cursor-pointer"
            >
              <span className="text-[10.5px] text-muted-foreground">strict_security:</span>
              <span
                className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                  config.strictSecurity
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {config.strictSecurity ? "true" : "false"}
              </span>
            </button>

            <button
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  autoApproveClean: !prev.autoApproveClean,
                }))
              }
              className="w-full flex items-center justify-between p-1.5 rounded bg-card hover:bg-muted border border-border transition-colors text-left cursor-pointer"
            >
              <span className="text-[10.5px] text-muted-foreground">auto_approve:</span>
              <span
                className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                  config.autoApproveClean
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {config.autoApproveClean ? "true" : "false"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CARD 5: Smart Auto-Approve ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Smart Auto-Approve
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Eliminate review bottlenecks. Clean pull requests and documentation updates get approved automatically.
          </p>
        </div>

        {/* Micro-UI: GitHub Checks Verdict */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 font-mono text-[11px] text-foreground">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border pb-2">
            <span>GitHub Checks Verdict</span>
            <span className="text-foreground font-medium">Passed</span>
          </div>

          <div className="bg-card p-2.5 rounded border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-foreground text-background flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <div>
                <p className="text-[10.5px] font-medium text-foreground">Approved by PRism</p>
                <p className="text-[9.5px] text-muted-foreground">0 blockers • 100/100 score</p>
              </div>
            </div>
            <span className="text-[9.5px] font-mono font-medium px-1.5 py-0.2 rounded bg-muted text-foreground border border-border">
              Ready
            </span>
          </div>
        </div>
      </div>

      {/* ── CARD 6: Zero-Latency Webhook Queue ── */}
      <div className="group rounded-xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-all duration-300">
        <div>
          <div className="w-8 h-8 rounded-lg bg-muted border border-border text-foreground flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Cpu className="w-4.5 h-4.5" />
          </div>
          <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
            Zero-Latency Webhook Pipeline
          </h3>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
            Parallel Celery workers and LangGraph agents stream feedback in seconds without delaying developer velocity.
          </p>
        </div>

        {/* Micro-UI: Queue Pipeline Flow */}
        <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 font-mono text-[11px] text-foreground">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border pb-2">
            <span>Distributed Queue</span>
            <span className="text-foreground font-mono">&lt; 1.8s avg</span>
          </div>

          <div className="flex items-center justify-between text-[10px] pt-0.5">
            <div className="px-2 py-1 rounded bg-card border border-border text-foreground">
              Webhook
            </div>
            <div className="flex-1 px-1 flex items-center justify-center">
              <div className="w-full h-0.5 bg-border rounded" />
            </div>
            <div className="px-2 py-1 rounded bg-card border border-border text-foreground">
              Celery
            </div>
            <div className="flex-1 px-1 flex items-center justify-center">
              <div className="w-full h-0.5 bg-border rounded" />
            </div>
            <div className="px-2 py-1 rounded bg-foreground text-background font-medium">
              Verdict
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
