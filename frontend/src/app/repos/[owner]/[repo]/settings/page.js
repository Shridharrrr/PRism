"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";

export default function RepoSettings() {
  const { owner, repo: name } = useParams();
  const router = useRouter();
  const [repo, setRepo] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

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

  if (loading) return <div>Loading...</div>;
  if (!repo) return <div>Repository not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar username="Admin" backHref={`/repos/${owner}/${name}/prs`} backLabel="Back to PRs" />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Repository Settings</h1>
        <p className="text-muted-foreground mb-8">Configure integrations and notifications for {owner}/{name}.</p>

        <form onSubmit={saveSettings} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.271 0a2.528 2.528 0 0 1-2.522 2.521 2.528 2.528 0 0 1-2.521-2.521V2.521A2.528 2.528 0 0 1 15.164 0a2.528 2.528 0 0 1 2.522 2.521v6.313zM15.164 18.959a2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.522 2.528 2.528 0 0 1-2.521-2.522v-2.52h2.521zm0-1.271a2.528 2.528 0 0 1-2.522-2.52 2.528 2.528 0 0 1 2.522-2.522h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.522h-6.313z"/></svg>
              Slack Integration
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">Webhook URL</label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/services/T000/B000/XXX"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">Paste your Slack Incoming Webhook URL here to receive notifications when a PR review completes.</p>
            </div>
          </div>
          <div className="bg-muted/30 px-6 py-4 flex items-center justify-between">
            {saved ? (
              <span className="text-sm text-green-600 font-medium">✓ Settings saved successfully</span>
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
      </main>
    </div>
  );
}
