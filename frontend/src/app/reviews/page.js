"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { FileSearch, CheckCircle, AlertCircle, Clock, Loader2, XCircle, AlertTriangle, Info } from "lucide-react";

const statusBadge = {
  completed: (
    <span className="badge-success inline-flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Completed
    </span>
  ),
  analyzing: (
    <span className="badge-info inline-flex items-center gap-1">
      <Clock className="h-3 w-3 animate-spin" />
      Analyzing
    </span>
  ),
  failed: (
    <span className="badge-error inline-flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      Failed
    </span>
  ),
};

const severityColor = {
  critical: "text-error",
  warning: "text-warning",
  info: "text-info",
};

export default function ReviewsListPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/api/reviews?limit=100");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (error) {
        console.error("Failed to load reviews", error);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Reviews</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Browse every review PRism has run and jump into individual reports.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading recent reviews…</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Go to a repository, open a PR, and run the AI review.
            </p>
            <Link
              href="/repos"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse repositories
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {reviews.map((review) => {
                const summary = review.flags_summary || {};
                return (
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
                          {statusBadge[review.status] || (
                            <span className="badge-info inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          #{review.pr_number} by {review.pr_author}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          {summary.critical > 0 && (
                            <span className={`${severityColor.critical} inline-flex items-center gap-1`}>
                              <XCircle className="h-3 w-3" /> {summary.critical} critical
                            </span>
                          )}
                          {summary.warning > 0 && (
                            <span className={`${severityColor.warning} inline-flex items-center gap-1`}>
                              <AlertTriangle className="h-3 w-3" /> {summary.warning} warnings
                            </span>
                          )}
                          {summary.info > 0 && (
                            <span className={`${severityColor.info} inline-flex items-center gap-1`}>
                              <Info className="h-3 w-3" /> {summary.info} suggestions
                            </span>
                          )}
                          {review.flag_count === 0 && (
                            <span className="text-success">Clean review</span>
                          )}
                          {review.created_at && (
                            <span className="text-muted-foreground">
                              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
