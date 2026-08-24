import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import {
  Shield,
  Zap,
  GitPullRequest,
  Bell,
  CheckCircle,
  ArrowRight,
  Code2,
  Eye,
  Lock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="PRism home">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-background" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              PRism
            </span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <Link
              href="/features"
              className="hidden sm:inline-flex px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <ThemeToggle />
            <LoginButton variant="outline" size="sm" />
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative flex items-center justify-center min-h-screen pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2/3 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_70%)] opacity-60" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Code Review</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-foreground">
            Code reviews that
            <br />
            <span className="text-foreground/70">actually matter</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            PRism analyzes your GitHub pull requests with specialized AI agents
            — catching security vulnerabilities, code smells, and improvement
            opportunities before they ever ship to production.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <LoginButton size="lg" />
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mockup terminal card */}
          <div className="relative mx-auto max-w-3xl">
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
              {/* terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">
                    PRism — AI Review Analysis
                  </span>
                </div>
              </div>

              {/* mock review content */}
              <div className="p-6 text-left font-mono text-sm space-y-3 bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Analyzing</span>
                  <span className="text-foreground font-semibold">
                    feat/user-authentication #47
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                    completed
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <span className="text-xs font-medium bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      critical
                    </span>
                    <div>
                      <p className="text-foreground text-xs">
                        SQL injection risk in{" "}
                        <code className="text-red-600 font-semibold">getUserById()</code> —
                        user input passed unsanitized to raw query
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        auth/db.js:34
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <span className="text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      warning
                    </span>
                    <div>
                      <p className="text-foreground text-xs">
                        JWT secret hardcoded as string literal, should use
                        environment variable
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        middleware/auth.js:12
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      info
                    </span>
                    <div>
                      <p className="text-foreground text-xs">
                        Consider adding rate limiting to auth endpoints to
                        prevent brute force attacks
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />1
                    critical
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />1
                    warning
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />1 info
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-muted-foreground font-medium mb-3 uppercase tracking-widest">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Everything you need for better code
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Specialized AI agents work together to give you comprehensive,
              actionable feedback on every pull request.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Shield,
                title: "Security Auditor",
                desc: "Detects SQL injection, XSS, hardcoded secrets, auth bypasses, and 50+ other vulnerability patterns.",
                color: "text-red-600",
                bg: "bg-red-50 border-red-200",
              },
              {
                icon: Eye,
                title: "Quality Inspector",
                desc: "Identifies code smells, anti-patterns, missing error handling, and opportunities for cleaner architecture.",
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-200",
              },
              {
                icon: Zap,
                title: "Instant Analysis",
                desc: "Get detailed AI review results in seconds. Multiple specialized agents run in parallel for speed.",
                color: "text-foreground",
                bg: "bg-muted border-border",
              },
              {
                icon: Bell,
                title: "Auto-Trigger",
                desc: "Enable webhooks to automatically analyze every new PR the moment it's opened. Zero manual steps.",
                color: "text-green-600",
                bg: "bg-green-50 border-green-200",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-lg border ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
            >
              Explore every capability <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-muted-foreground font-medium mb-3 uppercase tracking-widest">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Up and running in minutes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Connect your GitHub repositories, pick a pull request, and let
              PRism do the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div
              className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-border"
            />

            {[
              {
                step: "01",
                icon: GitPullRequest,
                title: "Connect your repos",
                desc: "Sign in with GitHub and connect the repositories you want to monitor. Enable auto-trigger for fully automated reviews.",
              },
              {
                step: "02",
                icon: Code2,
                title: "Analyze a PR",
                desc: "Select any open pull request and click Analyze. Our AI agents examine every changed file for issues.",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Review & decide",
                desc: "Browse categorized flags sorted by severity. Mark issues as safe or confirmed to track your decisions.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div
                key={step}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-xl border border-border bg-card flex items-center justify-center mb-5 relative shadow-sm">
                  <Icon className="w-7 h-7 text-foreground" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-bold">
                    {parseInt(step)}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flags breakdown ────────────────────────────── */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
              {[
                {
                  label: "Critical",
                  value: "Must fix",
                  desc: "Security vulnerabilities, data exposure, authentication flaws",
                  color: "text-red-600",
                  dot: "bg-red-500",
                },
                {
                  label: "Warning",
                  value: "Should fix",
                  desc: "Code quality issues, anti-patterns, missing validations",
                  color: "text-amber-600",
                  dot: "bg-amber-500",
                },
                {
                  label: "Info",
                  value: "Nice to have",
                  desc: "Suggestions, improvements, best practice recommendations",
                  color: "text-blue-600",
                  dot: "bg-blue-500",
                },
              ].map(({ label, value, desc, color, dot }) => (
                <div key={label} className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                    <span className={`font-semibold ${color}`}>{label}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1 text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-xl border border-border bg-card flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="w-6 h-6 text-foreground" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
            Catch bugs before they ship
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Join developers who use PRism to ship more secure, higher quality
            code. Connect your GitHub account to get started — it&apos;s free.
          </p>
          <LoginButton size="lg" />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 mt-auto bg-muted/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
              <div className="w-3 h-3 rounded bg-background" />
            </div>
            <span className="font-semibold text-sm text-foreground">
              PRism
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-Powered Code Reviews for GitHub Pull Requests
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js &amp; FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}
