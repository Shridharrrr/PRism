"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Loader2, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard/insights");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load analytics", error);
        setData({ trends: [], leaderboard: [], insights: {}, stats: {} });
      }
      setLoading(false);
    }
    load();
  }, []);

  const trends = data?.trends || [];
  const leaderboard = data?.leaderboard || [];
  const insights = data?.insights || {};
  const stats = data?.stats || {};

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Review volume, finding trends, and quality posture across your workspace.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading analytics…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Metric label="Completed reviews" value={stats.totalReviews || 0} />
              <Metric label="Critical findings" value={stats.criticalIssues || 0} />
              <Metric
                label="Quality score"
                value={insights.qualityTrend || "Pending"}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Findings over time</h2>
              <div className="h-[320px]">
                {trends.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-border"
                        opacity={0.4}
                      />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="bugs"
                        name="Findings"
                        stroke="oklch(0.63 0.27 280)"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="reviews"
                        name="Reviews"
                        stroke="oklch(0.58 0.19 150)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Author outcomes</h2>
              <div className="h-[320px]">
                {leaderboard.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaderboard}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-border"
                        opacity={0.4}
                      />
                      <XAxis dataKey="author" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="clean" name="Clean PRs" fill="oklch(0.58 0.19 150)" />
                      <Bar dataKey="fixed" name="Fixed" fill="oklch(0.63 0.27 280)" />
                      <Bar dataKey="unfixed" name="Open" fill="oklch(0.55 0.21 27)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <BarChart3 className="h-8 w-8 text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">
        Analytics appear after PRism has reviewed at least one pull request.
      </p>
    </div>
  );
}
