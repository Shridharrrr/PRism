"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileSearch, CheckCircle, AlertCircle, Clock } from "lucide-react";

export function ActivityFeed({ reviews }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="badge-success inline-flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case "analyzing":
        return (
          <span className="badge-info inline-flex items-center gap-1">
            <Clock className="h-3 w-3 animate-spin" />
            Analyzing
          </span>
        );
      case "failed":
        return (
          <span className="badge-error inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="badge-info inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Queued
          </span>
        );
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-error";
      case "warning":
        return "text-warning";
      default:
        return "text-info";
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start by analyzing your first pull request
        </p>
        <Link
          href="/repos"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Browse Repositories
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Latest code reviews and their results
        </p>
      </div>

      <div className="divide-y divide-border">
        {reviews.slice(0, 10).map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.id}`}
            className="block p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileSearch className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-medium text-sm truncate">
                    {review.pr_title}
                  </p>
                  {getStatusBadge(review.status)}
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  #{review.pr_number} by {review.pr_author}
                </p>

                {review.flags_summary && (
                  <div className="flex items-center gap-3 text-xs">
                    {review.flags_summary.critical > 0 && (
                      <span className={getSeverityColor("critical")}>
                        {review.flags_summary.critical} critical
                      </span>
                    )}
                    {review.flags_summary.warning > 0 && (
                      <span className={getSeverityColor("warning")}>
                        {review.flags_summary.warning} warnings
                      </span>
                    )}
                    {review.flags_summary.info > 0 && (
                      <span className={getSeverityColor("info")}>
                        {review.flags_summary.info} suggestions
                      </span>
                    )}
                  </div>
                )}

                {review.created_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="p-4 border-t border-border text-center">
          <Link
            href="/reviews"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all reviews →
          </Link>
        </div>
      )}
    </div>
  );
}
