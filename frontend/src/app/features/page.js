"use client";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import {
  Shield,
  Zap,
  GitPullRequest,
  Sparkles,
  BarChart3,
  MessageSquare,
  Settings,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: GitPullRequest,
    title: "GitHub-native reviews",
    description:
      "Connect a GitHub App, select a PR, and get a structured review posted back to GitHub with inline comments and a verdict.",
    status: "live",
  },
  {
    icon: Shield,
    title: "Security auditor",
    description:
      "Findings from the security agent are mapped to severity levels and surfaced in dashboards, reports, and GitHub review comments.",
    status: "live",
  },
  {
    icon: MessageSquare,
    title: "Conversational AI chat",
    description:
      "Ask follow-up questions inside any review to get explanations, fix suggestions, and localized code guidance.",
    status: "live",
  },
  {
    icon: Settings,
    title: ".prism.yaml control",
    description:
      "Configure severity thresholds, review state, ignore paths, and focus areas per repository.",
    status: "live",
  },
  {
    icon: Sparkles,
    title: "PR risk scoring",
    description:
      "Every review now includes a calculated risk score, estimated review time, complexity signal, and impact map.",
    status: "live",
  },
  {
    icon: BarChart3,
    title: "Quality trends",
    description:
      "Track repository health, technical debt hotspots, and recurring findings across time.",
    status: "live",
  },
  {
    icon: Lock,
    title: "Security compliance",
    description:
      "See OWASP-aligned posture tracking and audit-ready summaries generated from active review findings.",
    status: "beta",
  },
  {
    icon: Zap,
    title: "Performance insights",
    description:
      "Surface performance-related issues identified by review agents and attach follow-up guidance.",
    status: "beta",
  },
];

const statusStyles = {
  live: "badge-success",
  beta: "badge-info",
};

export default function FeaturesPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Features</h1>
          <p className="text-muted-foreground max-w-3xl">
            Everything PRism already does out of the box, plus the product areas
            that are actively rolling out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                </div>
                <span className={statusStyles[feature.status]}>
                  {feature.status === "live" ? "Live" : "Beta"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
