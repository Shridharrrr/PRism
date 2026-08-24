"use client";

import Link from "next/link";
import { Lightbulb, Trophy, TrendingUp, Shield, Zap } from "lucide-react";

export function InsightsPanel({ insights }) {
  const quickInsights = [
    {
      icon: Trophy,
      title: "Top Security Win",
      description: insights?.topSecurityWin || "No security findings yet",
    },
    {
      icon: TrendingUp,
      title: "Code Quality Trend",
      description: insights?.qualityTrend || "Quality score pending first review",
    },
    {
      icon: Shield,
      title: "Security Score",
      description: insights?.securityScore || "Security posture pending first review",
    },
    {
      icon: Zap,
      title: "Fastest Review",
      description: insights?.fastestReview || "Average review time pending",
    },
  ];

  const topRepos = insights?.topRepos || [];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-foreground" />
          <h2 className="text-sm font-medium text-foreground">Quick Insights</h2>
        </div>

        <div className="space-y-4 mt-6">
          {quickInsights.map((insight, index) => {
            const isPrimary = index === 0;
            return (
              <div
                key={insight.title}
                className={`flex items-start gap-3 p-3 rounded-md transition-colors ${
                  isPrimary ? "bg-muted/50 border border-border/50" : "hover:bg-muted/20"
                }`}
              >
                <div className="mt-0.5">
                  <insight.icon className={`h-4 w-4 ${isPrimary ? "text-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isPrimary ? "text-foreground" : "text-muted-foreground"}`}>{insight.title}</p>
                  <p className={`text-sm mt-1 ${isPrimary ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-2">AI Weekly Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {insights?.aiSummary ||
            "Run a few pull request reviews and PRism will summarize findings, quality, and security posture here."}
        </p>
        <Link
          href="/analytics"
          className="text-sm font-medium text-primary hover:underline transition-colors"
        >
          View detailed report →
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-medium text-foreground mb-4">Most Active Repos</h3>
        {topRepos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active repositories monitored yet.
          </p>
        ) : (
          <div className="space-y-3">
            {topRepos.map((repo) => (
              <div key={repo.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">
                  {repo.name}
                </span>
                <span className="font-medium text-foreground shrink-0">
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
