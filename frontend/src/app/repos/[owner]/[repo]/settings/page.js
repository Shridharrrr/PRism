"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";

export default function RepoSettings() {
  const { owner, repo: name } = useParams();
  const [repo, setRepo] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchRepo() {
      const { data } = await supabase
        .from("repos")
        .select("*")
        .eq("owner", owner)
        .eq("name", name)
        .single();

      if (data) {
        setRepo(data);
        setWebhookUrl(data.slack_webhook_url || "");
      }
      setLoading(false);
    }
    fetchRepo();
  }, [owner, name, supabase]);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      await fetch(`http://localhost:8000/api/repos/${repo.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slack_webhook_url: webhookUrl }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <Link
          href={`/repos/${owner}/${name}/prs`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PRs
        </Link>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading settings…</p>
          </div>
        ) : !repo ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">Repository not found.</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Repository Settings</h1>
            <p className="text-muted-foreground mb-8">
              Configure integrations and notifications for {owner}/{name}.
            </p>

            <form
              onSubmit={saveSettings}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold mb-4">Slack Integration</h2>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://hooks.slack.com/services/T000/B000/XXX"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste your Slack Incoming Webhook URL here to receive notifications when a PR review completes.
                  </p>
                </div>
              </div>
              <div className="bg-muted/30 px-6 py-4 flex items-center justify-between">
                {saved ? (
                  <span className="text-sm text-success font-medium">Settings saved successfully</span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-foreground text-background hover:bg-foreground/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
