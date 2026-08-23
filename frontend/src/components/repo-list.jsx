"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  GitFork,
  Lock,
  Globe,
  ChevronRight,
  Bell,
  BellOff,
  Loader2,
  Search,
  Settings,
} from "lucide-react";

export function RepoList({ accessToken, userId }) {
  const [repos, setRepos] = useState([]);
  const [connected, setConnected] = useState(new Set());
  const [webhookEnabled, setWebhookEnabled] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(new Set());
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch(
        "https://api.github.com/user/repos?sort=updated&per_page=50",
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json();
      if (!Array.isArray(data)) {
        setError(data.message || "Failed to fetch repos");
        setLoading(false);
        return;
      }
      setRepos(data);

      const { data: saved } = await supabase
        .from("repos")
        .select("github_repo_id, webhook_enabled")
        .eq("user_id", userId);

      if (saved) {
        setConnected(new Set(saved.map((r) => r.github_repo_id)));
        setWebhookEnabled(
          new Set(
            saved.filter((r) => r.webhook_enabled).map((r) => r.github_repo_id),
          ),
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const connect = async (repo) => {
    setConnecting((prev) => new Set(prev).add(repo.id));
    await supabase.from("repos").upsert({
      user_id: userId,
      github_repo_id: repo.id,
      full_name: repo.full_name,
      name: repo.name,
      owner: repo.owner.login,
      private: repo.private,
      webhook_enabled: false,
    });
    setConnected((prev) => new Set(prev).add(repo.id));
    setConnecting((prev) => {
      const next = new Set(prev);
      next.delete(repo.id);
      return next;
    });
  };

  const toggleWebhook = async (repo) => {
    const isEnabled = webhookEnabled.has(repo.id);
    await supabase
      .from("repos")
      .update({ webhook_enabled: !isEnabled })
      .eq("github_repo_id", repo.id)
      .eq("user_id", userId);

    setWebhookEnabled((prev) => {
      const next = new Set(prev);
      isEnabled ? next.delete(repo.id) : next.add(repo.id);
      return next;
    });
  };

  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="w-full h-11 rounded-lg border border-border bg-muted/50 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-[68px] rounded-lg border border-border bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center mx-auto mb-3">
          <GitPullRequest className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-red-900 text-sm font-medium mb-1">
          Failed to load repositories
        </p>
        <p className="text-red-700 text-xs">{error}</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all"
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
        <span>{repos.length} repositories</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="text-foreground font-medium">
          {connected.size} connected
        </span>
      </div>

      {/* Repo rows */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No repositories match &quot;{search}&quot;
            </p>
          </div>
        )}

        {filtered.map((repo) => {
          const isConnected = connected.has(repo.id);
          const isWebhookOn = webhookEnabled.has(repo.id);
          const isConnecting = connecting.has(repo.id);

          return (
            <div
              key={repo.id}
              className={`group flex items-center gap-4 px-5 py-3.5 rounded-lg border transition-all duration-200 ${
                isConnected
                  ? "border-border bg-muted/50 hover:bg-muted"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                  isConnected
                    ? "bg-foreground/10 border-foreground/20"
                    : "bg-muted border-border"
                }`}
              >
                <GitFork
                  className={`w-4 h-4 ${isConnected ? "text-foreground" : "text-muted-foreground"}`}
                />
              </div>

              {/* Repo info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-medium text-sm truncate text-foreground">
                    {repo.full_name}
                  </p>
                  {repo.private ? (
                    <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(repo.updated_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {repo.language && (
                    <span className="ml-2 before:content-['·'] before:mr-2">
                      {repo.language}
                    </span>
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isConnected ? (
                  <>
                    {/* Webhook toggle */}
                    <button
                      onClick={() => toggleWebhook(repo)}
                      title={
                        isWebhookOn
                          ? "Auto-trigger ON — click to disable"
                          : "Auto-trigger OFF — click to enable"
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isWebhookOn
                          ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {isWebhookOn ? (
                        <Bell className="w-3 h-3" />
                      ) : (
                        <BellOff className="w-3 h-3" />
                      )}
                      <span className="hidden sm:inline">
                        {isWebhookOn ? "Auto ON" : "Auto OFF"}
                      </span>
                    </button>

                    {/* View PRs */}
                    <button
                      onClick={() =>
                        router.push(
                          `/repos/${repo.owner.login}/${repo.name}/prs`,
                        )
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-foreground/20 bg-foreground text-background hover:bg-foreground/90 transition-all"
                    >
                      View PRs
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    {/* Settings */}
                    <button
                      onClick={() =>
                        router.push(
                          `/repos/${repo.owner.login}/${repo.name}/settings`,
                        )
                      }
                      title="Settings"
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => !isConnecting && connect(repo)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />{" "}
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
