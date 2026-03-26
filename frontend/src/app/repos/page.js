import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RepoList } from "@/components/repo-list";
import { Navbar } from "@/components/navbar";
import { GitFork } from "lucide-react";

export default async function ReposPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_username, github_avatar_url, github_access_token")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        username={profile?.github_username}
        avatarUrl={profile?.github_avatar_url}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <GitFork className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Your Repositories
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Connect a repository to start analyzing pull requests with AI
          </p>
        </div>

        {/* Tip banner */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 mb-8 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground/90">Quick start:</span>
            <span className="text-muted-foreground ml-1">
              Click <strong className="text-foreground/80">Connect</strong> on a
              repo to track it, then{" "}
              <strong className="text-foreground/80">View PRs</strong> to see
              open pull requests. Enable{" "}
              <strong className="text-foreground/80">Auto</strong> to trigger
              analysis automatically on new PRs.
            </span>
          </div>
        </div>

        <RepoList
          accessToken={profile?.github_access_token ?? ""}
          userId={user.id}
        />
      </main>
    </div>
  );
}
