"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
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
  Legend
} from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard/stats");
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar username="Admin" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar username="Admin" backHref="/repos" backLabel="Repos" />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Engineering Analytics</h1>
          <p className="text-muted-foreground">Monitor repository health, code quality trends, and team performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Code Health Trends (Bugs Caught)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="date" tick={{fontSize: 12}} tickMargin={10} stroke="#888" />
                  <YAxis tick={{fontSize: 12}} stroke="#888" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="bugs" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Vulnerabilities */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Most Common Vulnerabilities</h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              {data.vulnerabilities?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.vulnerabilities}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data.vulnerabilities.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">✓</div>
                  <p>No vulnerabilities found yet!</p>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold mb-6">Developer Leaderboards</h2>
            <div className="h-[300px] w-full">
              {data.leaderboard?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leaderboard} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" opacity={0.2} />
                    <XAxis type="number" stroke="#888" allowDecimals={false} />
                    <YAxis dataKey="author" type="category" tick={{fontSize: 12}} stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Legend />
                    <Bar dataKey="clean_prs" name="Clean PRs (0 issues)" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="issues_fixed" name="Issues Fixed" stackId="a" fill="#6366f1" />
                    <Bar dataKey="issues_found" name="Issues Found (Unfixed)" stackId="a" fill="#f43f5e" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No developer data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
