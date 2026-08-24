"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileSearch,
  ShieldAlert,
  CheckCircle2,
  Timer,
} from "lucide-react";

function AnimatedNumber({ value, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = Number.parseInt(value, 10) || 0;
    if (end === 0) {
      const resetTimer = setTimeout(() => setCount(0), 0);
      return () => clearTimeout(resetTimer);
    }

    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function StatsCards({ stats }) {
  const cards = [
    {
      label: "Total Reviews",
      value: stats.totalReviews || 0,
      change: stats.reviewsChange || 0,
      icon: FileSearch,
      color: "text-chart-1",
      iconBg: "bg-chart-1/10 text-chart-1",
    },
    {
      label: "Critical Issues Caught",
      value: stats.criticalIssues || 0,
      change: stats.criticalChange || 0,
      icon: ShieldAlert,
      color: "text-error",
      iconBg: "bg-error/10 text-error",
    },
    {
      label: "PRs Auto-Approved",
      value: stats.autoApproved || 0,
      change: stats.approvedChange || 0,
      icon: CheckCircle2,
      color: "text-success",
      iconBg: "bg-success/10 text-success",
    },
    {
      label: "Avg Review Time",
      value: `${stats.avgReviewTime || 0}m`,
      change: stats.timeChange || 0,
      icon: Timer,
      color: "text-warning",
      iconBg: "bg-warning/10 text-warning",
    },
  ];

  const getTrendIcon = (change) => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (change) => {
    if (change > 0) return "text-success";
    if (change < 0) return "text-error";
    return "text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="stat-card group"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fade-up 0.6s ease forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {card.change !== 0 && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${getTrendColor(
                    card.change
                  )}`}
                >
                  {getTrendIcon(card.change)}
                  <span>{Math.abs(card.change)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {typeof card.value === "string" && card.value.includes("m") ? (
                  card.value
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
