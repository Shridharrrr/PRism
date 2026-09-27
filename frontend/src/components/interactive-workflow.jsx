"use client";

import { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  GitBranch,
  Layers,
  Check,
  Shield,
  Zap,
  GitFork,
  Radio,
} from "lucide-react";

export function InteractiveWorkflow() {
  const [activeStep, setActiveStep] = useState(1);
  const [isMerged, setIsMerged] = useState(false);
  const [isRepoConnected, setIsRepoConnected] = useState(true);

  return (
    <div className="space-y-12">
      {/* ── 3 Connected Step Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative">
        {/* Step 1 */}
        <div
          onClick={() => setActiveStep(1)}
          className={`relative rounded-xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
            activeStep === 1
              ? "border-2 border-foreground bg-card shadow-sm -translate-y-1"
              : "border border-border bg-card/60 hover:border-foreground/30 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                  activeStep === 1
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                01
              </span>
              <GitFork className="w-4 h-4 text-muted-foreground" />
            </div>

            <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
              Install the GitHub App
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
              Authorize PRism in one click. Select individual repositories or enable organization-wide coverage in seconds.
            </p>
          </div>

          {/* Micro-UI: Interactive Repository Switcher */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 font-mono text-[11px] text-foreground">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border">
              <span>GitHub App Installation</span>
              <span className="text-muted-foreground">Click to toggle</span>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsRepoConnected(!isRepoConnected);
              }}
              className="flex items-center justify-between p-2 rounded bg-card border border-border hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-foreground font-medium truncate">
                  acme / core-api
                </span>
              </div>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border shrink-0 transition-colors ${
                  isRepoConnected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {isRepoConnected ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => setActiveStep(2)}
          className={`relative rounded-xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
            activeStep === 2
              ? "border-2 border-foreground bg-card shadow-sm -translate-y-1"
              : "border border-border bg-card/60 hover:border-foreground/30 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                  activeStep === 2
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                02
              </span>
              <Layers className="w-4 h-4 text-muted-foreground" />
            </div>

            <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
              Open Any Pull Request
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
              Webhooks fire automatically. Coordinated agents analyze the AST diff and verify security boundaries in parallel.
            </p>
          </div>

          {/* Micro-UI: Laser Scanning Beam */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 font-mono text-[11px] text-foreground relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-foreground animate-spin" />
                <span className="text-foreground font-medium">PR #142 Diff Scan</span>
              </span>
              <span className="font-mono text-muted-foreground">Active</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-card border border-border">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Shield className="w-3 h-3 text-muted-foreground" />
                  Security Auditor
                </span>
                <span className="text-foreground text-[10px] font-medium font-mono">1 finding</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-card border border-border">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  Quality Inspector
                </span>
                <span className="text-muted-foreground text-[10px] font-medium font-mono">Clean</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => setActiveStep(3)}
          className={`relative rounded-xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden ${
            activeStep === 3
              ? "border-2 border-foreground bg-card shadow-sm -translate-y-1"
              : "border border-border bg-card/60 hover:border-foreground/30 hover:shadow-xs"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded transition-colors ${
                  activeStep === 3
                    ? "bg-foreground text-background font-medium"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                03
              </span>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>

            <h3 className="text-base font-medium font-heading text-foreground mb-1.5 tracking-tight">
              Merge with Confidence
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6 font-normal">
              Review line-by-line annotations, accept 1-click suggestions, and merge pull requests knowing production is safe.
            </p>
          </div>

          {/* Micro-UI: Interactive Merge Button */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 font-mono text-[11px] text-foreground">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pb-1.5 border-b border-border">
              <span>GitHub Verdict</span>
              <span className="text-foreground font-medium">Checks Passed</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMerged(!isMerged);
              }}
              className={`w-full py-2 px-3 rounded-md text-xs font-medium font-mono flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                isMerged
                  ? "bg-muted text-foreground border border-border"
                  : "bg-foreground text-background hover:opacity-90"
              }`}
            >
              {isMerged ? (
                <>
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Merged into main</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Merge Pull Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
