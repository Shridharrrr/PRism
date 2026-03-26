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
          <div className="w-full h-11 rounded-xl border border-border/50 bg-card/40 animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-[68px] rounded-xl border border-border/50 bg-card/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-destructive text-sm font-medium mb-1">
          Failed to load repositories
        </p>
        <p className="text-muted-foreground text-xs">{error}</p>
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
          className="w-full rounded-xl border border-border/60 bg-card/50 pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
        <span>{repos.length} repositories</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span className="text-primary font-medium">
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
              className={`group flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all duration-200 ${
                isConnected
                  ? "border-primary/25 bg-primary/5 hover:border-primary/40 hover:bg-primary/8"
                  : "border-border/50 bg-card/40 hover:border-border hover:bg-card/70"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                  isConnected
                    ? "bg-primary/15 border-primary/25"
                    : "bg-secondary border-border/50"
                }`}
              >
                <GitFork
                  className={`w-4 h-4 ${isConnected ? "text-primary" : "text-muted-foreground"}`}
                />
              </div>

              {/* Repo info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-medium text-sm truncate">
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
                          ? "bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25"
                          : "bg-secondary border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all"
                    >
                      View PRs
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => !isConnecting && connect(repo)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium border border-border/60 bg-secondary text-secondary-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
