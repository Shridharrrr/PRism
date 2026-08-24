"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReviewHeader } from "@/components/review-header";
import { FlagGroup } from "@/components/flag-group";
import { AnalysisGraph } from "@/components/analysis-graph";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";

export default function ReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [flags, setFlags] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    async function fetchReview() {
      const res = await fetch(`http://localhost:8000/api/reviews/${id}`);
      const data = await res.json();
      if (cancelled) return;
      setReview(data.review);
      setFlags(data.flags ?? []);
      const report = data.agent_outputs?.find(
        (o) => o.agent_name === "report_writer",
      );
      setFinalReport(report?.raw_output ?? null);
      setLoading(false);

      try {
        const insightsRes = await fetch(
          `http://localhost:8000/api/reviews/${id}/insights`,
        );
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (!cancelled) setInsights(insightsData.insights);
        }
      } catch {
        // Insights are optional until the SaaS tables exist.
      }
    }
    fetchReview();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel(`review-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reviews",
          filter: `id=eq.${id}`,
        },
        async (payload) => {
          setReview((prev) => ({ ...prev, ...payload.new }));
          if (payload.new.status === "completed") {
            const res = await fetch(`http://localhost:8000/api/reviews/${id}`);
            const data = await res.json();
            setReview(data.review);
            setFlags(data.flags ?? []);
            const report = data.agent_outputs?.find(
              (o) => o.agent_name === "report_writer",
            );
            setFinalReport(report?.raw_output ?? null);
            setLoading(false);
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, supabase]);

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading review...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!review) {
    return (
      <AuthenticatedLayout>
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 text-center">
          <p className="text-destructive text-sm mb-4">Review not found.</p>
          <Link href="/reviews" className="text-sm text-primary hover:underline">
            ← Back to reviews
          </Link>
        </div>
      </AuthenticatedLayout>
    );
  }

  const decidedCount = flags.filter((f) => f.user_decision !== null).length;

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All reviews
        </Link>

        <ReviewHeader
          review={review}
          flagCount={flags.length}
          decidedCount={decidedCount}
          finalReport={finalReport}
        />

        {insights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <InsightStat
              label="Risk score"
              value={`${insights.risk_score ?? 0}/100`}
            />
            <InsightStat
              label="Est. review time"
              value={`${insights.estimated_review_time_minutes ?? 0}m`}
            />
            <InsightStat
              label="Complexity"
              value={insights.complexity_score ?? "—"}
            />
            <InsightStat
              label="Impact"
              value={
                insights.change_impact?.summary ||
                insights.change_impact?.level ||
                "—"
              }
            />
          </div>
        )}

        {review.status === "analyzing" || review.status === "queued" ? (
          <div className="mb-10">
            <AnalysisGraph review={review} flags={flags} />
          </div>
        ) : review.status === "failed" ? (
          <div className="rounded-lg border border-error/30 bg-error/5 p-6 text-center">
            <p className="text-foreground font-medium mb-1">Analysis failed</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong while analyzing this PR. Please try again.
            </p>
          </div>
        ) : (
          <FlagGroup flags={flags} />
        )}
      </div>
      <ChatWidget reviewId={id} />
    </AuthenticatedLayout>
  );
}

function InsightStat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-semibold truncate">{String(value)}</p>
    </div>
  );
}
