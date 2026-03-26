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

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/repos");

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span className="font-semibold text-sm tracking-wide gradient-text-brand">
              PRism
            </span>
          </div>
          <LoginButton variant="outline" size="sm" />
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative flex items-center justify-center min-h-screen pt-14">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="animate-blob absolute top-1/4 left-1/4 w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.63 0.27 280 / 0.12), transparent 70%)",
            }}
          />
          <div
            className="animate-blob-delay-2 absolute top-1/3 right-1/4 w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.56 0.2 260 / 0.1), transparent 70%)",
            }}
          />
          <div
            className="animate-blob-delay-4 absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.63 0.27 300 / 0.08), transparent 70%)",
            }}
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none" />

        {/* Radial fade at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 40%, oklch(0.09 0.018 280) 100%)",
          }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8 animate-fade-up">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Code Review</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-foreground">Code reviews that</span>
            <br />
            <span className="gradient-text-brand">actually matter</span>
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
          <div className="relative mx-auto max-w-3xl animate-float">
            <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden card-glow">
              {/* terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/40">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground font-mono">
                    PRism — AI Review Analysis
                  </span>
                </div>
              </div>

              {/* mock review content */}
              <div className="p-6 text-left font-mono text-sm space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Analyzing</span>
                  <span className="text-primary font-semibold">
                    feat/user-authentication #47
                  </span>
                  <span className="text-xs bg-primary/15 text-primary border border-primary/25 rounded-full px-2 py-0.5">
                    completed
                  </span>
                </div>

                <div className="h-px bg-border/50 my-2" />

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
                    <span className="text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      critical
                    </span>
                    <div>
                      <p className="text-foreground/90 text-xs">
                        SQL injection risk in{" "}
                        <code className="text-red-400">getUserById()</code> —
                        user input passed unsanitized to raw query
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        auth/db.js:34
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2.5">
                    <span className="text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      warning
                    </span>
                    <div>
                      <p className="text-foreground/90 text-xs">
                        JWT secret hardcoded as string literal, should use
                        environment variable
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        middleware/auth.js:12
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5">
                    <span className="text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      info
                    </span>
                    <div>
                      <p className="text-foreground/90 text-xs">
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
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />1
                    warning
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />1 info
                  </span>
                </div>
              </div>
            </div>

            {/* glow below card */}
            <div
              className="absolute -bottom-8 inset-x-0 h-24 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 100% at 50% 100%, oklch(0.63 0.27 280 / 0.12), transparent)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-medium mb-3 uppercase tracking-widest">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
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
                color: "text-red-400",
                bg: "bg-red-500/10 border-red-500/20",
              },
              {
                icon: Eye,
                title: "Quality Inspector",
                desc: "Identifies code smells, anti-patterns, missing error handling, and opportunities for cleaner architecture.",
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Zap,
                title: "Instant Analysis",
                desc: "Get detailed AI review results in seconds. Multiple specialized agents run in parallel for speed.",
                color: "text-primary",
                bg: "bg-primary/10 border-primary/20",
              },
              {
                icon: Bell,
                title: "Auto-Trigger",
                desc: "Enable webhooks to automatically analyze every new PR the moment it's opened. Zero manual steps.",
                color: "text-green-400",
                bg: "bg-green-500/10 border-green-500/20",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-xl border border-border/60 bg-card/50 p-6 card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-lg border ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────── */}
      <section id="how-it-works" className="relative py-28 px-6">
        {/* subtle divider gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.63 0.27 280 / 0.04), transparent)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-medium mb-3 uppercase tracking-widest">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
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
              className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, oklch(0.63 0.27 280 / 0.4), transparent)",
              }}
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
                <div className="w-16 h-16 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center mb-5 relative">
                  <Icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold leading-none">
                    {parseInt(step)}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flags breakdown ────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {[
                {
                  label: "Critical",
                  value: "Must fix",
                  desc: "Security vulnerabilities, data exposure, authentication flaws",
                  color: "text-red-400",
                  dot: "bg-red-500",
                },
                {
                  label: "Warning",
                  value: "Should fix",
                  desc: "Code quality issues, anti-patterns, missing validations",
                  color: "text-amber-400",
                  dot: "bg-amber-500",
                },
                {
                  label: "Info",
                  value: "Nice to have",
                  desc: "Suggestions, improvements, best practice recommendations",
                  color: "text-blue-400",
                  dot: "bg-blue-500",
                },
              ].map(({ label, value, desc, color, dot }) => (
                <div key={label} className="p-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                    <span className={`font-semibold ${color}`}>{label}</span>
                  </div>
                  <p className="text-2xl font-bold mb-1">{value}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.63 0.27 280 / 0.1), transparent)",
            }}
          />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
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
      <footer className="border-t border-border/50 py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            </div>
            <span className="font-semibold text-sm gradient-text-brand">
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
