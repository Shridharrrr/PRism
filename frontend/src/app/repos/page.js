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
            <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
              <GitFork className="w-5 h-5 text-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Your Repositories
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-[52px]">
            Connect a repository to start analyzing pull requests with AI
          </p>
        </div>

        {/* Tip banner */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 mb-8 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-blue-900">Quick start:</span>
            <span className="text-blue-700 ml-1">
              Click <strong className="text-blue-900">Connect</strong> on a
              repo to track it, then{" "}
              <strong className="text-blue-900">View PRs</strong> to see
              open pull requests. Enable{" "}
              <strong className="text-blue-900">Auto</strong> to trigger
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
