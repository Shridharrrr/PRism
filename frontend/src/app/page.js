import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import {
  Shield,
  Zap,
  GitPullRequest,
  CheckCircle,
  ArrowRight,
  Code2,
  Terminal,
  Play,
  Github,
  Twitter,
  Mail,
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Navbar ─────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="PRism home">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center transition-transform group-hover:scale-95">
              <div className="w-3 h-3 bg-background" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              PRism
            </span>
          </Link>
          <nav className="flex items-center gap-6" aria-label="Primary navigation">
            <Link
              href="/features"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/docs"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <ThemeToggle />
              <LoginButton variant="default" size="sm" />
            </div>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] pt-32 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_50%)] opacity-[0.08]" />
        </div>

        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none mix-blend-overlay" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* Badge Placeholder (Invisible to retain layout) */}
          <div className="invisible pointer-events-none inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-8">
            <Terminal className="w-4 h-4" />
            <span><strong className="font-bold">PRism CLI</strong> - Coming Soon</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-light tracking-tight leading-[0.95] mb-8 text-foreground">
            Don't let bad code
            <br />
            <span className="text-muted-foreground">reach production.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Your invisible senior engineer. PRism catches vulnerabilities and architectural flaws in your pull requests before you merge.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <LoginButton size="lg" className="w-full sm:w-auto font-bold tracking-wide" />
            <a
              href="#demo"
              className="group flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all w-full sm:w-auto"
            >
              Watch Demo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Hero Video Placeholder */}
          <div id="demo" className="relative mx-auto max-w-4xl w-full aspect-video border border-border bg-card shadow-2xl p-2 group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-muted/20 z-0" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
               <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
                 <Play className="w-6 h-6 ml-1" />
               </div>
            </div>
            <div className="relative z-10 h-full w-full border border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center text-muted-foreground">
               <p className="font-mono text-sm">[ Hero Product Demo Video Placeholder ]</p>
               <p className="text-xs mt-2 opacity-60">Aspect ratio 16:9 recommended</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="relative py-32 px-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 md:w-2/3">
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6 text-foreground">
              Engineered for velocity.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We know reviews take time. PRism runs instantly, giving you human-quality feedback so you can merge with confidence and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Vulnerability Scanning",
                desc: "We look beyond simple linting. PRism identifies logic flaws, SQLi, and hardcoded secrets.",
              },
              {
                icon: Code2,
                title: "Architecture Review",
                desc: "Get suggestions on design patterns, dry code, and structural improvements.",
              },
              {
                icon: Zap,
                title: "Zero-Latency Analysis",
                desc: "Reviews generated in seconds using highly optimized multi-agent workflows.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative border border-border bg-card p-8 hover:bg-muted/10 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow / How it Works with Mini Videos ─────── */}
      <section className="relative py-32 px-6 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6 text-foreground">
              How PRism works
            </h2>
          </div>

          <div className="space-y-32">
            {[
              {
                step: "01",
                title: "Connect & Configure",
                desc: "Authenticate with your GitHub account. Select the repositories you want to protect. PRism listens via webhooks to analyze PRs as soon as they are opened.",
              },
              {
                step: "02",
                title: "AI Analysis",
                desc: "Our specialized agents read the diff, understand the context of your architecture, and provide targeted feedback directly on the lines of code.",
              },
              {
                step: "03",
                title: "Merge with Confidence",
                desc: "Review the dashboard, approve or reject flags, and ensure your main branch stays pristine.",
              },
            ].map(({ step, title, desc }, idx) => (
              <div key={step} className={`flex flex-col lg:flex-row gap-16 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1 space-y-6">
                  <div className="text-sm font-bold text-primary font-mono tracking-wider">STEP {step}</div>
                  <h3 className="text-3xl font-light text-foreground">{title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
                
                {/* Feature Video Placeholder */}
                <div className="flex-1 w-full aspect-video border border-border bg-card shadow-lg p-2 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-muted/10 z-0" />
                    <div className="relative z-10 h-full w-full border border-dashed border-muted-foreground/30 bg-background/50 flex flex-col items-center justify-center text-muted-foreground transition-colors group-hover:bg-muted/30">
                       <Play className="w-8 h-8 mb-4 opacity-50" />
                       <p className="font-mono text-sm">[ Step {step} Demo Video Placeholder ]</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative py-32 px-6 border-t border-border">
        <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-5xl sm:text-7xl font-light tracking-tighter mb-6 text-foreground">
            Ready to upgrade your{" "}
            <span className="font-semibold text-primary/90">workflow?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop merging technical debt. Start shipping secure, beautiful code today.
          </p>
          <LoginButton size="lg" className="px-12 py-6 text-lg font-bold mb-16" />
          

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-border py-12 px-6 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-foreground flex items-center justify-center">
              <div className="w-2 h-2 bg-background" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              PRism
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            
            {/* Divider */}
            <div className="w-px h-4 bg-border mx-2 hidden sm:block"></div>
            
            <a href="https://github.com/Shridharrrr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="https://x.com/shridharJsx" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Twitter className="w-4 h-4" />
              <span className="hidden sm:inline">Twitter</span>
            </a>
            <a href="mailto:shridharmandrekar118@gmail.com" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PRism. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
