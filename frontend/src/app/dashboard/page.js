"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
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
} from "recharts";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { InsightsPanel } from "@/components/dashboard/insights-panel";

// Minimalist monochromatic palette
const CATEGORY_COLORS = [
  "var(--foreground)",
  "var(--primary)",
  "var(--muted-foreground)",
  "var(--border)",
  "oklch(0.4 0 0)",
  "oklch(0.3 0 0)",
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
        
        {/* Top Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Code quality and review insights
            </p>
          </div>
        </div>

        {loading ? (
          <div className="border border-border bg-card p-16 text-center shadow-sm">
            <div className="font-mono text-xs text-muted-foreground animate-pulse">
              LOADING TELEMETRY DATA...
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="mb-8">
              <StatsCards stats={stats} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Middle Main Columns */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Activity Feed */}
                <ActivityFeed reviews={recentReviews} />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Review Trends Chart */}
                  <div className="border border-border bg-card p-6 shadow-sm rounded-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-sm font-medium text-foreground">
                        Review Trends
                      </h2>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          Findings
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                          Reviews
                        </span>
                      </div>
                    </div>

                    <div className="h-[260px] w-full">
                      {trends.length === 0 ? (
                        <EmptyChart label="No review activity recorded yet" />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trends} margin={{ top: 5, right: 25, left: -15, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradientBugs" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="gradientReviews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              axisLine={false}
                              tickLine={false}
                              tickMargin={12}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              tickMargin={12}
                            />
                            <Tooltip 
                              content={<ChartTooltip />} 
                              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }} 
                            />
                            <Area
                              type="natural"
                              dataKey="reviews"
                              name="Reviews"
                              stroke="var(--muted-foreground)"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#gradientReviews)"
                              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--muted-foreground)" }}
                            />
                            <Area
                              type="natural"
                              dataKey="bugs"
                              name="Findings"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#gradientBugs)"
                              activeDot={{ r: 4, strokeWidth: 0, fill: "var(--primary)" }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Issues Breakdown Donut */}
                  <div className="border border-border bg-card p-6 shadow-sm rounded-lg">
                    <div className="mb-6">
                      <h2 className="text-sm font-medium text-foreground">
                        Issues Breakdown
                      </h2>
                    </div>

                    {vulnerabilities.length === 0 ? (
                      <div className="h-[240px]">
                        <EmptyChart label="No vulnerability breakdown available" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="h-[170px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={vulnerabilities}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {vulnerabilities.map((entry, index) => (
                                  <Cell
                                    key={entry.name}
                                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                    stroke="var(--card)"
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="w-full space-y-2 pt-4 border-t border-border mt-4 text-sm">
                          {vulnerabilities.slice(0, 6).map((item, idx) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <span className="flex items-center gap-2 text-muted-foreground">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                                />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-medium text-foreground">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Developer Leaderboard */}
                <div className="border border-border bg-card p-6 shadow-sm rounded-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-medium text-foreground">
                      Developer Leaderboard
                    </h2>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full inline-block" /> Clean
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-foreground rounded-full inline-block" /> Fixed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full inline-block" /> Unfixed
                      </span>
                    </div>
                  </div>

                  <div className="w-full space-y-5">
                    {leaderboard.length === 0 ? (
                      <EmptyChart label="Developer metrics appear after pull request reviews" />
                    ) : (
                      (() => {
                        const maxTotal = Math.max(...leaderboard.map(d => d.clean + d.fixed + d.unfixed)) || 1;
                        
                        return leaderboard.map((dev) => {
                          const total = dev.clean + dev.fixed + dev.unfixed;
                          const cleanPct = (dev.clean / maxTotal) * 100;
                          const fixedPct = (dev.fixed / maxTotal) * 100;
                          const unfixedPct = (dev.unfixed / maxTotal) * 100;

                          return (
                            <div key={dev.author} className="flex flex-col gap-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground truncate">{dev.author}</span>
                                <span className="text-muted-foreground text-xs shrink-0">{total} PRs</span>
                              </div>
                              <div className="flex h-2.5 w-full rounded-full bg-accent overflow-hidden">
                                {cleanPct > 0 && (
                                  <div style={{ width: `${cleanPct}%` }} className="bg-muted-foreground h-full transition-all duration-500" />
                                )}
                                {fixedPct > 0 && (
                                  <div style={{ width: `${fixedPct}%` }} className="bg-foreground h-full transition-all duration-500" />
                                )}
                                {unfixedPct > 0 && (
                                  <div style={{ width: `${unfixedPct}%` }} className="bg-primary h-full transition-all duration-500" />
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

              </div>

              {/* Right Insights Sidebar */}
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
    <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground p-6">
      {label}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border bg-card p-3 text-sm shadow-md rounded-lg min-w-[140px]">
      {label && <p className="mb-2 font-medium border-b border-border pb-1 text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey || item.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || item.fill }} />
              {item.name}
            </span>
            <span className="text-foreground font-medium text-xs">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
