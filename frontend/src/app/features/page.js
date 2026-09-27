"use client";

import { LandingNavbar } from "@/components/landing-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import {
  Shield,
  Zap,
  GitPullRequest,
  Activity,
  BarChart3,
  MessageSquare,
  Settings,
  Lock,
  ArrowRight,
  Code2,
} from "lucide-react";
import { LoginButton } from "@/components/login-button";

const features = [
  {
    icon: GitPullRequest,
    title: "GitHub-Native Reviews",
    description:
      "Posts structured reviews directly back to GitHub with inline code suggestions, approval verdicts, and status checks.",
    status: "live",
  },
  {
    icon: Shield,
    title: "Security Auditor Agent",
    description:
      "Deeply analyzes code for SQLi, XSS, SSRF, hardcoded secrets, and auth flaws with OWASP severity ratings.",
    status: "live",
  },
  {
    icon: MessageSquare,
    title: "Conversational PR Chat",
    description:
      "Ask follow-up questions inside any review thread on GitHub to receive instant explanations and localized code fixes.",
    status: "live",
  },
  {
    icon: Settings,
    title: ".prism.yaml Rule Engine",
    description:
      "Fine-tune severity thresholds, ignore paths, automated approval conditions, and review tone per repository.",
    status: "live",
  },
  {
    icon: Activity,
    title: "Autonomous Risk Scoring",
    description:
      "Every pull request receives an algorithmic risk score, estimated human review duration, and blast radius index.",
    status: "live",
  },
  {
    icon: BarChart3,
    title: "Velocity & Quality Trends",
    description:
      "Monitor repo health, recurring technical debt patterns, and engineer review velocity in real-time dashboards.",
    status: "live",
  },
  {
    icon: Lock,
    title: "Compliance & Audit Readiness",
    description:
      "OWASP and SOC2-aligned posture tracking and audit-ready review histories generated from every merged PR.",
    status: "beta",
  },
  {
    icon: Zap,
    title: "Performance & N+1 Detection",
    description:
      "Identifies memory leaks, unindexed database queries, and blocking asynchronous operations with optimized code alternatives.",
    status: "beta",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-28 pb-20">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-4">
            <span>Capabilities & Roadmap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] mb-4 text-foreground">
            Everything you need for superhuman pull request reviews.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            PRism combines AST parsing, semantic embedding search, and specialized AI agents to deliver human-grade feedback in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bento-card group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-muted/80 border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <span
                    className={
                      feature.status === "live"
                        ? "badge-success"
                        : "badge-info"
                    }
                  >
                    {feature.status === "live" ? "Live" : "Beta"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Card */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-12 rounded-2xl border border-border bg-card/60 backdrop-blur-md text-center flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground mb-3">
            Ready to integrate PRism with your repositories?
          </h2>
          <p className="text-muted-foreground max-w-xl mb-6 text-sm sm:text-base">
            Get started in under two minutes. No complex CI/CD setup required.
          </p>
          <LoginButton size="lg" />
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
