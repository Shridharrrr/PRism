"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GitPullRequest,
  User,
  Calendar,
  Loader2,
  Sparkles,
  FileCode,
  GitMerge,
} from "lucide-react";

export function PRList({ owner, repo, repoId, accessToken, userId }) {
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState({});
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/repos/${owner}/${repo}/prs?token=${accessToken}`,
        );
        const data = await res.json();
        setPrs(data.prs || []);
      } catch (e) {
        setError(
          "Failed to load pull requests. Make sure the backend is running.",
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const analyze = async (pr) => {
    setAnalyzing((prev) => ({ ...prev, [pr.number]: true }));
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_id: repoId,
          owner,
          repo,
          pr_number: pr.number,
          pr_title: pr.title,
          pr_url: pr.url,
          pr_author: pr.author,
          user_id: userId,
          github_token: accessToken,
        }),
      });
      const data = await res.json();
      if (data.review_id) {
        router.push(`/reviews/${data.review_id}`);
      }
    } catch (e) {
      setAnalyzing((prev) => ({ ...prev, [pr.number]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-border/50 bg-card/40 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-3">
          <GitPullRequest className="w-5 h-5 text-destructive" />
        </div>
        <p className="text-destructive text-sm font-medium mb-1">
          Error loading pull requests
        </p>
        <p className="text-muted-foreground text-xs">{error}</p>
      </div>
    );

  if (prs.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center">
          <GitMerge className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground mb-1">
            No open pull requests
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            There are no open PRs in{" "}
            <strong className="text-foreground/70">
              {owner}/{repo}
            </strong>{" "}
            right now.
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Count header */}
      <p className="text-xs text-muted-foreground px-1 mb-1">
        {prs.length} open pull request{prs.length !== 1 ? "s" : ""}
      </p>

      {prs.map((pr) => (
        <div
          key={pr.number}
          className="group flex items-start gap-4 px-5 py-5 rounded-xl border border-border/50 bg-card/40 hover:border-primary/25 hover:bg-primary/5 transition-all duration-200"
        >
          {/* PR icon with number */}
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <GitPullRequest className="w-4 h-4 text-primary" />
          </div>

          {/* PR details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                #{pr.number}
              </span>
              {pr.draft && (
                <span className="text-xs bg-secondary text-secondary-foreground border border-border/50 px-2 py-0.5 rounded-full">
                  Draft
                </span>
              )}
            </div>

            <p className="font-semibold text-sm leading-snug mb-2.5 text-foreground group-hover:text-primary transition-colors">
              {pr.title}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <User className="w-3 h-3" />
                {pr.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(pr.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {pr.changed_files != null && (
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3 h-3" />
                  {pr.changed_files} file{pr.changed_files !== 1 ? "s" : ""}{" "}
                  changed
                </span>
              )}
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={() => analyze(pr)}
            disabled={analyzing[pr.number]}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 hover:border-primary/50 transition-all shrink-0 mt-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {analyzing[pr.number] ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Analyze PR</span>
                <span className="sm:hidden">Analyze</span>
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
