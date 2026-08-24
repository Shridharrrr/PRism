"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

export function ActivityFeed({ reviews }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />;
      case "analyzing":
        return <Clock className="h-4 w-4 text-primary animate-pulse" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
        <h3 className="text-base font-medium mb-2 text-foreground">No recent activity</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Connect a repository to see automated PR reviews.
        </p>
        <Link
          href="/repos"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Connect Repository
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">
          Recent Activity
        </h2>
        <span className="text-xs text-muted-foreground">
          Live Updates
        </span>
      </div>

      <div className="divide-y divide-border">
        {reviews.slice(0, 8).map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.id}`}
            className="block p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getStatusIcon(review.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {review.pr_title}
                  </p>
                  {review.created_at && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>#{review.pr_number} by {review.pr_author}</span>
                  
                  {review.flags_summary && (
                    <div className="flex items-center gap-2">
                      {review.flags_summary.critical > 0 && (
                        <span>• {review.flags_summary.critical} critical</span>
                      )}
                      {review.flags_summary.warning > 0 && (
                        <span>• {review.flags_summary.warning} warnings</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="p-4 border-t border-border text-center bg-muted/10">
          <Link
            href="/reviews"
            className="text-sm font-medium text-primary hover:underline transition-colors"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  );
}
