"use client";

import Link from "next/link";
import { Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

export function InsightsPanel({ insights }) {
  const quickInsights = [
    {
      icon: Sparkles,
      title: "Top Security Win",
      description: insights?.topSecurityWin || "No security findings yet",
      color: "text-chart-1",
      bg: "bg-chart-1/10",
    },
    {
      icon: TrendingUp,
      title: "Code Quality Trend",
      description: insights?.qualityTrend || "Quality score pending first review",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: Shield,
      title: "Security Score",
      description: insights?.securityScore || "Security posture pending first review",
      color: "text-info",
      bg: "bg-info/10",
    },
    {
      icon: Zap,
      title: "Fastest Review",
      description: insights?.fastestReview || "Average review time pending",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  const topRepos = insights?.topRepos || [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-chart-1" />
          <h2 className="text-lg font-semibold">Quick Insights</h2>
        </div>

        <div className="space-y-3">
          {quickInsights.map((insight) => (
            <div
              key={insight.title}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}
              >
                <insight.icon className={`h-4 w-4 ${insight.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-0.5">{insight.title}</p>
                <p className="text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">AI Weekly Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {insights?.aiSummary ||
            "Run a few pull request reviews and PRism will summarize findings, quality, and security posture here."}
        </p>
        <Link
          href="/analytics"
          className="text-sm font-medium text-chart-1 hover:text-chart-1/80 transition-colors"
        >
          View detailed report →
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Most Active Repos</h3>
        {topRepos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Connect a repository and run a review to populate this list.
          </p>
        ) : (
          <div className="space-y-2">
            {topRepos.map((repo) => (
              <div key={repo.name} className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground truncate">
                  {repo.name}
                </span>
                <span className="text-xs font-medium bg-muted px-2 py-1 rounded shrink-0">
                  {repo.reviews} reviews
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
