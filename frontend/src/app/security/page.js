"use client";

import { useEffect, useState } from "react";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Loader2, Shield } from "lucide-react";

export default function SecurityPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard/insights");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to load security insights", error);
        setData(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const insights = data?.insights || {};
  const vulnerabilities = data?.vulnerabilities || [];
  const stats = data?.stats || {};

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Security</h1>
          <p className="text-muted-foreground">
            Workspace security posture derived from PRism findings, not a trained model.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading security posture…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-info" />
                  <p className="text-sm text-muted-foreground">Security score</p>
                </div>
                <p className="text-2xl font-bold">{insights.securityScore || "Pending"}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground mb-2">Critical issues</p>
                <p className="text-2xl font-bold">{stats.criticalIssues || 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm text-muted-foreground mb-2">Latest audit note</p>
                <p className="text-sm leading-relaxed">{insights.topSecurityWin || "No findings yet."}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Finding categories</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Mapped from recorded flags across recent reviews.
                </p>
              </div>
              {vulnerabilities.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Security categories appear once PRism records findings.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {vulnerabilities.map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-6 py-4">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
