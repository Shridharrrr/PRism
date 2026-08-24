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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { Loader2 } from "lucide-react";

const COLORS = [
  "oklch(0.63 0.27 280)",
  "oklch(0.71 0.19 150)",
  "oklch(0.55 0.21 27)",
  "oklch(0.58 0.19 150)",
  "oklch(0.75 0.15 70)",
  "oklch(0.65 0.15 230)",
];

const EMPTY_STATS = {
  totalReviews: 0,
  criticalIssues: 0,
  autoApproved: 0,
  avgReviewTime: 0,
  reviewsChange: 0,
  criticalChange: 0,
  approvedChange: 0,
  timeChange: 0,
};

const EMPTY_INSIGHTS = {
  topSecurityWin: "No security findings yet",
  qualityTrend: "Quality score pending first review",
  securityScore: "Security posture pending first review",
  fastestReview: "Average review time pending",
  aiSummary:
    "Run a few pull request reviews and PRism will summarize findings, quality, and security posture here.",
  topRepos: [],
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard/insights");
        if (!res.ok) throw new Error("Failed to load insights");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Dashboard load error:", e);
        setData({
          stats: EMPTY_STATS,
          recentReviews: [],
          trends: [],
          vulnerabilities: [],
          leaderboard: [],
          insights: EMPTY_INSIGHTS,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const stats = data?.stats || EMPTY_STATS;
  const insights = data?.insights || EMPTY_INSIGHTS;
  const recentReviews = data?.recentReviews || [];
  const trends = data?.trends || [];
  const vulnerabilities = data?.vulnerabilities || [];
  const leaderboard = data?.leaderboard || [];

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your code quality, track improvements, and see AI insights.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading workspace insights…</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <StatsCards stats={stats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ActivityFeed reviews={recentReviews} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Review Trends</h2>
                    <div className="h-[280px] w-full">
                      {trends.length === 0 ? (
                        <EmptyChart label="No review activity yet" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trends}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="currentColor"
                              className="text-border"
                              opacity={0.4}
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              stroke="currentColor"
                              className="text-muted-foreground"
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                              stroke="currentColor"
                              className="text-muted-foreground"
                              allowDecimals={false}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Line
                              type="monotone"
                              dataKey="bugs"
                              name="Findings"
                              stroke="oklch(0.63 0.27 280)"
                              strokeWidth={3}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="reviews"
                              name="Reviews"
                              stroke="oklch(0.58 0.19 150)"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Issues Breakdown</h2>
                    <div className="h-[280px] w-full flex items-center justify-center">
                      {vulnerabilities.length === 0 ? (
                        <EmptyChart label="No findings to chart yet" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={vulnerabilities}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {vulnerabilities.map((entry, index) => (
                                <Cell
                                  key={entry.name}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-6">Developer Leaderboard</h2>
                  <div className="h-[300px] w-full">
                    {leaderboard.length === 0 ? (
                      <EmptyChart label="Leaderboard appears after the first reviews" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={leaderboard}
                          layout="vertical"
                          margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal
                            vertical={false}
                            stroke="currentColor"
                            className="text-border"
                            opacity={0.4}
                          />
                          <XAxis
                            type="number"
                            stroke="currentColor"
                            className="text-muted-foreground"
                            allowDecimals={false}
                          />
                          <YAxis
                            dataKey="author"
                            type="category"
                            tick={{ fontSize: 12 }}
                            stroke="currentColor"
                            className="text-muted-foreground"
                          />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                          <Legend />
                          <Bar
                            dataKey="clean"
                            name="Clean PRs"
                            fill="oklch(0.58 0.19 150)"
                            radius={[0, 4, 4, 0]}
                          />
                          <Bar dataKey="fixed" name="Issues Fixed" fill="oklch(0.63 0.27 280)" />
                          <Bar dataKey="unfixed" name="Unfixed" fill="oklch(0.55 0.21 27)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <InsightsPanel insights={insights} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((item) => (
        <p key={item.dataKey || item.name} className="text-muted-foreground">
          {item.name}: <span className="text-foreground font-medium">{item.value}</span>
        </p>
      ))}
    </div>
  );
}
