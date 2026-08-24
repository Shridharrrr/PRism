"use client";

import Link from "next/link";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bell, FolderGit2, Palette, Shield } from "lucide-react";

export default function SettingsIndexPage() {
  return (
    <AuthenticatedLayout>
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Workspace defaults, appearance, and where to configure per-repo integrations.
        </p>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">Appearance</h2>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark. The choice is stored in this browser.
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Repository integrations</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  Slack webhooks, auto-trigger, and GitHub connection live on each repository.
                </p>
                <Link
                  href="/repos"
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  Open repositories →
                </Link>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Review completions currently notify via Slack when a webhook is configured
                  on the repository. In-app notification preferences are next.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Review policy</h2>
                <p className="text-sm text-muted-foreground">
                  Per-repo review behavior is controlled by{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    .prism.yaml
                  </code>{" "}
                  in the repository root.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
