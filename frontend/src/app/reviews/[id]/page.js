"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { ReviewHeader } from "@/components/review-header";
import { FlagGroup } from "@/components/flag-group";
import { AnalysisGraph } from "@/components/analysis-graph";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [review, setReview] = useState(null);
  const [flags, setFlags] = useState([]);
  const [finalReport, setFinalReport] = useState(null);
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

  if (loading)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* minimal nav */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span
                className="font-semibold text-sm bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd)",
                }}
              >
                PRism
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Loading review...</p>
          </div>
        </main>
      </div>
    );

  if (!review)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span
                className="font-semibold text-sm bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd)",
                }}
              >
                PRism
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
          <div className="text-center py-24">
            <p className="text-destructive text-sm mb-4">Review not found.</p>
            <Link
              href="/repos"
              className="text-sm text-primary hover:underline"
            >
              ← Back to repositories
            </Link>
          </div>
        </main>
      </div>
    );

  const decidedCount = flags.filter((f) => f.user_decision !== null).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/repos"
              className="flex items-center gap-2 shrink-0 group"
            >
              <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors group-hover:bg-primary/30">
                <div className="w-3 h-3 rounded-sm bg-primary" />
              </div>
              <span
                className="font-semibold text-sm bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd)",
                }}
              >
                PRism
              </span>
            </Link>
            <span className="text-border/80 text-sm select-none">/</span>
            <span className="text-sm text-muted-foreground truncate">
              Review
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <ReviewHeader
          review={review}
          flagCount={flags.length}
          decidedCount={decidedCount}
          finalReport={finalReport}
        />

        {review.status === "analyzing" || review.status === "queued" ? (
          <div className="mb-10">
            <AnalysisGraph review={review} flags={flags} />
          </div>
        ) : review.status === "failed" ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-destructive font-medium mb-1">Analysis failed</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong while analyzing this PR. Please try again.
            </p>
          </div>
        ) : (
          <FlagGroup flags={flags} />
        )}
      </main>
    </div>
  );
}
