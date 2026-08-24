"use client";

import { useEffect, useState } from "react";
import {
  FileSearch,
  ShieldAlert,
  CheckCircle2,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
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
      label: "Critical Issues Caught",
      value: stats.criticalIssues || 0,
      change: stats.criticalChange || 0,
      icon: ShieldAlert,
      hierarchy: "primary",
    },
    {
      label: "Total Reviews",
      value: stats.totalReviews || 0,
      change: stats.reviewsChange || 0,
      icon: FileSearch,
      hierarchy: "secondary",
    },
    {
      label: "PRs Auto-Approved",
      value: stats.autoApproved || 0,
      change: stats.approvedChange || 0,
      icon: CheckCircle2,
      hierarchy: "secondary",
    },
    {
      label: "Avg Review Time",
      value: `${stats.avgReviewTime || 0}m`,
      change: stats.timeChange || 0,
      icon: Timer,
      hierarchy: "tertiary",
    },
  ];

  const getCardStyle = (hierarchy) => {
    switch (hierarchy) {
      case "primary":
        return {
          container: "bg-foreground text-background border-foreground shadow-md ring-1 ring-foreground/20",
          label: "text-background/80 font-medium",
          value: "text-background",
          icon: "text-background/80",
          changePos: "text-background/90",
          changeNeg: "text-background/70",
        };
      case "tertiary":
        return {
          container: "bg-muted/30 text-muted-foreground border-border/40 shadow-none",
          label: "text-muted-foreground/70",
          value: "text-muted-foreground",
          icon: "text-muted-foreground/50",
          changePos: "text-muted-foreground",
          changeNeg: "text-muted-foreground/60",
        };
      case "secondary":
      default:
        return {
          container: "bg-card text-foreground border-border shadow-sm",
          label: "text-muted-foreground font-medium",
          value: "text-foreground",
          icon: "text-muted-foreground",
          changePos: "text-primary",
          changeNeg: "text-muted-foreground",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
        const style = getCardStyle(card.hierarchy);

        return (
          <div
            key={card.label}
            className={`rounded-lg border p-6 transition-all hover:shadow-md ${style.container}`}
            style={{
              animationDelay: `${index * 80}ms`,
              animation: "fade-up 0.5s ease forwards",
              opacity: 0,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-sm ${style.label}`}>
                {card.label}
              </span>
              <Icon className={`h-4 w-4 ${style.icon}`} />
            </div>

            <div className="flex items-baseline gap-2">
              <div className={`text-3xl font-medium tracking-tight ${style.value}`}>
                {typeof card.value === "string" && card.value.includes("m") ? (
                  card.value
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </div>
              {card.change !== 0 && (
                <span className={`flex items-center text-xs font-medium ${isPositive ? style.changePos : style.changeNeg}`}>
                  <TrendIcon className="h-3 w-3 mr-0.5" />
                  {Math.abs(card.change)}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
