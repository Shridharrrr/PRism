import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRList } from "@/components/pr-list";
import { Navbar } from "@/components/navbar";
import { GitPullRequest } from "lucide-react";

export default async function PRsPage({ params }) {
  const { owner, repo } = await params;
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

  const { data: repoData } = await supabase
    .from("repos")
    .select("id")
    .eq("owner", owner)
    .eq("name", repo)
    .single();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        username={profile?.github_username}
        avatarUrl={profile?.github_avatar_url}
        backHref="/repos"
        backLabel="Repositories"
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
              <GitPullRequest className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {owner}/{repo}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Open pull requests — click{" "}
            <strong className="text-foreground/70">Analyze PR</strong> to run
            the AI review
          </p>
        </div>

        <PRList
          owner={owner}
          repo={repo}
          repoId={repoData?.id}
          accessToken={profile?.github_access_token ?? ""}
          userId={user.id}
        />
      </main>
    </div>
  );
}
