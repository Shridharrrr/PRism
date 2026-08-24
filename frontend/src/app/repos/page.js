import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RepoList } from "@/components/repo-list";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
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
    <AuthenticatedLayout>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
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

        <div className="rounded-lg border border-info/30 bg-info/5 px-5 py-4 mb-8 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-info/15 flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-info" />
          </div>
          <div className="text-sm">
            <span className="font-medium text-foreground">Quick start:</span>
            <span className="text-muted-foreground ml-1">
              Click <strong className="text-foreground">Connect</strong> on a
              repo to track it, then{" "}
              <strong className="text-foreground">View PRs</strong> to see
              open pull requests. Enable{" "}
              <strong className="text-foreground">Auto</strong> to trigger
              analysis automatically on new PRs.
            </span>
          </div>
        </div>

        <RepoList
          accessToken={profile?.github_access_token ?? ""}
          userId={user.id}
        />
      </div>
    </AuthenticatedLayout>
  );
}
