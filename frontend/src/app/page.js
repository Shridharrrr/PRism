import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LandingNavbar } from "@/components/landing-navbar";
import { LoginButton } from "@/components/login-button";
import { BentoFeatures } from "@/components/bento-features";
import { InteractiveWorkflow } from "@/components/interactive-workflow";
import { ArrowRight, Github, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-foreground selection:text-background">
      {/* ── Navbar ─────────────────────────────────────── */}
      <LandingNavbar />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center pt-32 sm:pt-40 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Glow & Grid Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl opacity-70 dark:opacity-40" />
          <div className="absolute inset-0 grid-pattern opacity-15 dark:opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,black_40%,transparent_100%)]" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-muted/40 mb-8 transition-all hover:border-foreground/30">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-foreground">Autonomous multi-agent pull request reviews</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-normal font-heading tracking-[-0.035em] leading-[1.08] mb-6 text-foreground max-w-4xl mx-auto">
            Don&apos;t let bad code<br className="hidden sm:inline" /> reach production.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-[1.2rem] text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal tracking-[-0.01em]">
            Your invisible senior engineer. PRism deploys specialized AI agents to catch security vulnerabilities, architecture flaws, and regressions before you merge.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <LoginButton size="lg" className="w-full sm:w-auto" />
            <a
              href="#features"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 text-sm sm:text-base font-medium rounded-xl text-foreground bg-transparent hover:bg-muted/60 border border-border transition-all w-full sm:w-auto active:scale-[0.98]"
            >
              <span>Explore Capabilities</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Key Metrics & Social Proof ─────────────────── */}
      <section className="border-y border-border/80 bg-muted/20 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                99.4%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Vulnerability Precision
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                &lt; 1.8s
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Average Diff Processing
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                100%
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                GitHub Checks & Reviews Native
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-foreground">
                0
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                Secrets Leaked to Main
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid (Interactive & Animated) ── */}
      <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 bg-background relative scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium border border-border bg-muted/40 text-muted-foreground mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>Engineered Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.035em] text-foreground mb-4 font-heading">
              Engineered for velocity and uncompromising quality.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
              PRism replaces superficial linters with coordinated AI agents that understand your architecture, AST dependencies, and security boundaries.
            </p>
          </div>

          {/* Dynamic Bento Grid with Micro-UIs */}
          <BentoFeatures />
        </div>
      </section>

      {/* ── Workflow Steps (Connected & Interactive) ───── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-muted/30 border-t border-border/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium border border-border bg-muted/40 text-muted-foreground mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
              <span>Seamless Integration</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-[-0.035em] text-foreground mb-4 font-heading">
              How PRism fits into your team
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Zero workflow changes required. PRism lives natively inside your existing GitHub repository and pull request lifecycle.
            </p>
          </div>

          {/* Interactive Step-by-Step Flow */}
          <InteractiveWorkflow />
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 border-t border-border/80 bg-background overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-heading tracking-[-0.035em] mb-6 text-foreground">
            Ready to upgrade your engineering workflow?
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop merging technical debt and security oversights. Experience autonomous code reviews built for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <LoginButton size="lg" className="w-full sm:w-auto shadow-xl" />
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border/80 py-12 px-4 sm:px-6 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-background rounded-xs" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              PRism
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <a
              href="https://github.com/Shridharrrr/PRism"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://x.com/shridharJsx"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </a>
            <a
              href="mailto:shridharmandrekar118@gmail.com"
              className="hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} PRism. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
