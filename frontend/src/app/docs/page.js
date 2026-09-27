"use client";

import { useState } from "react";
import { LandingNavbar } from "@/components/landing-navbar";
import { AppFooter } from "@/components/layout/app-footer";
import {
  BookOpen,
  GitBranch,
  Settings,
  Shield,
  Zap,
  MessageSquare,
  CheckCircle2,
  Terminal,
  Cpu,
  Bell,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  Sliders,
  FileCode,
  Sparkles,
  Bot,
  ThumbsUp,
  Radio,
  ArrowRight,
} from "lucide-react";

export default function DocsPage() {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeThreadIndex, setActiveThreadIndex] = useState(0);
  const [reacted, setReacted] = useState(false);
  const [committed, setCommitted] = useState(false);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const navSections = [
    {
      category: "Getting Started",
      items: [
        { id: "overview", title: "Overview & Architecture" },
        { id: "installation", title: "Installation & Setup" },
      ],
    },
    {
      category: "Core Engine",
      items: [
        { id: "multi-agent", title: "Multi-Agent Pipeline" },
        { id: "webhooks", title: "Webhooks & GitHub Events" },
        { id: "interactive-threads", title: "Interactive AI Comments" },
      ],
    },
    {
      category: "Policy & Automation",
      items: [
        { id: "configuration", title: ".prism.yaml Specification" },
        { id: "auto-approve", title: "Auto-Approval & Gates" },
        { id: "notifications", title: "Slack Notifications" },
      ],
    },
  ];

  const threads = [
    {
      title: "DataLoader N+1 Query",
      file: "src/api/auth/session.ts",
      lines: "42-45",
      engineer: {
        name: "alex-dev",
        role: "Author",
        time: "12m ago",
        question: "Why did you flag this DataLoader query? We only run it once during user login.",
      },
      aiResponse: {
        latency: "2s",
        model: "Gemini 3.5 Flash",
        body: "While login traffic is lower than read traffic, unbounded sequential await statements still exhaust the connection pool during peak sign-in spikes. Batching this with Promise.all drops roundtrips from 5 to 1 without additional infrastructure.",
        diffBefore: `- const user = await DataLoader.load(userId);\n- const perms = await PermissionLoader.load(userId);`,
        diffAfter: `+ const [user, perms] = await Promise.all([\n+   DataLoader.load(userId),\n+   PermissionLoader.load(userId)\n+ ]);`,
      },
    },
    {
      title: "SQL Injection in Filter",
      file: "backend/api/users.py",
      lines: "88-91",
      engineer: {
        name: "marcus-backend",
        role: "Contributor",
        time: "8m ago",
        question: "Is f-string interpolation really unsafe here if the string is sanitized by regex first?",
      },
      aiResponse: {
        latency: "2s",
        model: "Gemini 3.5 Flash",
        body: "Regex filtering on user input is brittle against alternate character encodings. Using SQLAlchemy parameterized bind variables eliminates query injection risk entirely at zero runtime cost.",
        diffBefore: `- query = f"SELECT * FROM users WHERE org_id = '{org_id}'"`,
        diffAfter: `+ query = select(User).where(User.org_id == bindparam("org_id"))`,
      },
    },
    {
      title: "Silent Error Suppression",
      file: "src/worker/export.ts",
      lines: "114-118",
      engineer: {
        name: "elena-eng",
        role: "Author",
        time: "5m ago",
        question: "Can we just log this error to console.warn so the background worker doesn't crash?",
      },
      aiResponse: {
        latency: "2s",
        model: "Gemini 3.5 Flash",
        body: "Swallowing the rejected promise causes Celery to report the task as SUCCESS even though zero files were generated. Propagating the error ensures retry policies execute and incidents are tracked.",
        diffBefore: `- catch (err) { console.warn("Failed export:", err); }`,
        diffAfter: `+ catch (err) {\n+   Sentry.captureException(err);\n+   throw new TaskRetryException("Export worker failed", { cause: err });\n+ }`,
      },
    },
  ];

  const currentThread = threads[activeThreadIndex];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background scroll-smooth">
      <LandingNavbar />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row pt-24 pb-16 px-4 sm:px-6">
        {/* ── Left Sticky Sidebar Navigation (Desktop) ── */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-border h-[calc(100vh-6.5rem)] sticky top-24 overflow-y-auto pr-6 space-y-6">
          <div className="space-y-6">
            {navSections.map((group) => (
              <div key={group.category}>
                <h4 className="text-[11px] font-mono font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
                  {group.category}
                </h4>
                <ul className="space-y-1 border-l border-border pl-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block text-xs font-medium text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all py-1"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Mobile Sticky Navigation Pill Strip ── */}
        <div className="md:hidden sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border -mx-4 px-4 py-2.5 flex items-center gap-2 overflow-x-auto text-xs font-medium mb-6">
          {navSections.flatMap((g) => g.items).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="px-3 py-1.5 rounded-md bg-muted text-foreground whitespace-nowrap shrink-0 hover:bg-muted/80 transition-colors"
            >
              {item.title}
            </a>
          ))}
        </div>

        {/* ── Main Documentation Content ── */}
        <main className="flex-1 md:pl-10 lg:pl-14 max-w-4xl space-y-16">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-border">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-muted text-foreground border border-border">
              Documentation // v1.0
            </div>
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-foreground font-heading">
              Engineering Documentation
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-normal">
              Architecture specifications, multi-agent pipeline mechanics, GitHub App integrations, and verified <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground">.prism.yaml</code> configuration guidelines.
            </p>
          </div>

          {/* ── 1. Overview & Architecture ── */}
          <section id="overview" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <BookOpen className="w-5 h-5 text-foreground" />
              <h2>Overview &amp; Architecture</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              PRism is an autonomous code review system built for teams that demand rigorous security and architecture auditing without sacrificing merge velocity. Rather than relying on superficial regex linters, PRism utilizes coordinated Google Gemini AI agents orchestrated via LangGraph, Celery, and Redis to perform deep semantic review of incoming git diffs.
            </p>

            {/* Architecture diagram card */}
            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border pb-3">
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <Cpu className="w-4 h-4 text-foreground" />
                  <span>system_architecture.svg</span>
                </span>
                <span className="font-mono text-muted-foreground">Verified Pipeline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Stage 01</span>
                  <p className="font-medium text-foreground text-sm font-heading">GitHub Webhook</p>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">PR opened, synchronized, or commented with HMAC verification</p>
                </div>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Stage 02</span>
                  <p className="font-medium text-foreground text-sm font-heading">FastAPI &amp; Celery</p>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">Asynchronous Redis broker with automatic retry policies</p>
                </div>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Stage 03</span>
                  <p className="font-medium text-foreground text-sm font-heading">LangGraph Engine</p>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">Parallel Gemini 3.5 Flash security and quality auditing</p>
                </div>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Stage 04</span>
                  <p className="font-medium text-foreground text-sm font-heading">GitHub Checks &amp; PR</p>
                  <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">Inline code diff annotations, Slack alert, and merge verdict</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── 2. Installation & Setup ── */}
          <section id="installation" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <GitBranch className="w-5 h-5 text-foreground" />
              <h2>Installation &amp; Setup</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              PRism connects to your repositories through a native GitHub App installation. You can deploy PRism as a hosted platform or run the entire stack locally for development.
            </p>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-sm font-medium font-heading text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-foreground text-background font-mono text-xs flex items-center justify-center font-bold">1</span>
                  <span>Connect GitHub Repository</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7">
                  Log in to PRism using your GitHub account via Supabase Auth OAuth. In the <strong>Repositories</strong> tab, click <strong>Connect Repository</strong> or install the PRism GitHub App on selected personal or organizational repositories.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border bg-card space-y-4">
                <h3 className="text-sm font-medium font-heading text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-foreground text-background font-mono text-xs flex items-center justify-center font-bold">2</span>
                  <span>Local Stack Setup (Developers)</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7">
                  Running PRism locally requires Docker (Redis), Python 3.10+ (FastAPI + Celery), and Node.js 18+ (Next.js):
                </p>

                <div className="pl-7 space-y-3">
                  {/* Step 2a: Redis */}
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/30 font-mono text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-muted/60 border-b border-border text-[11px] text-muted-foreground">
                      <span>1. Start Redis Broker</span>
                      <button
                        onClick={() => copyToClipboard("docker-compose up -d", "redis")}
                        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedKey === "redis" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "redis" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="p-3 text-foreground font-mono">
                      <span className="text-muted-foreground select-none mr-2">$</span>docker-compose up -d
                    </div>
                  </div>

                  {/* Step 2b: Celery */}
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/30 font-mono text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-muted/60 border-b border-border text-[11px] text-muted-foreground">
                      <span>2. Start Celery Worker</span>
                      <button
                        onClick={() => copyToClipboard("cd backend\ncelery -A celery_app worker --pool=solo --loglevel=info", "celery")}
                        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedKey === "celery" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "celery" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="p-3 space-y-1 font-mono text-foreground">
                      <div className="text-muted-foreground text-[11px]"># Windows PowerShell:</div>
                      <div><span className="text-muted-foreground select-none mr-2">$</span>celery -A celery_app worker --pool=solo --loglevel=info</div>
                      <div className="text-muted-foreground text-[11px] pt-1"># macOS / Linux:</div>
                      <div><span className="text-muted-foreground select-none mr-2">$</span>celery -A celery_app worker --loglevel=info</div>
                    </div>
                  </div>

                  {/* Step 2c: FastAPI */}
                  <div className="rounded-lg border border-border overflow-hidden bg-muted/30 font-mono text-xs">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-muted/60 border-b border-border text-[11px] text-muted-foreground">
                      <span>3. Start Backend &amp; Frontend</span>
                      <button
                        onClick={() => copyToClipboard("uvicorn main:app --reload --port 8000\ncd ../frontend && npm run dev", "servers")}
                        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedKey === "servers" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === "servers" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="p-3 space-y-1 font-mono text-foreground">
                      <div className="text-muted-foreground text-[11px]"># Terminal 2 (Backend API):</div>
                      <div><span className="text-muted-foreground select-none mr-2">$</span>uvicorn main:app --reload --port 8000</div>
                      <div className="text-muted-foreground text-[11px] pt-1"># Terminal 3 (Next.js App):</div>
                      <div><span className="text-muted-foreground select-none mr-2">$</span>cd frontend &amp;&amp; npm run dev</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Multi-Agent Pipeline ── */}
          <section id="multi-agent" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <Shield className="w-5 h-5 text-foreground" />
              <h2>Multi-Agent Pipeline</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When a pull request event triggers <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs text-foreground">analyze_pr_task</code>, PRism constructs an isolated LangGraph state graph (<code className="bg-muted px-1 py-0.5 rounded font-mono text-xs text-foreground">prism_graph</code>) with the following specialized stages:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Agent 1 */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm font-heading">
                    <Terminal className="w-4 h-4 text-foreground" />
                    <span>1. Code Reader Node</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">AST Context</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Extracts file change trees, diff line contexts, and semantic intentions from the PR title, description, and commit history. Produces a cohesive code summary consumed by downstream inspectors.
                </p>
              </div>

              {/* Agent 2 */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm font-heading">
                    <Shield className="w-4 h-4 text-foreground" />
                    <span>2. Security Auditor (Parallel)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">CWE / OWASP</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Executes concurrently via <code className="font-mono text-[11px] text-foreground">asyncio.gather</code>. Identifies CWE/OWASP vulnerabilities including SQL injection, unescaped XSS, hardcoded secret tokens, SSRF, and authorization flaws.
                </p>
              </div>

              {/* Agent 3 */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm font-heading">
                    <Zap className="w-4 h-4 text-foreground" />
                    <span>3. Quality Inspector (Parallel)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">Anti-Patterns</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluates architectural health, N+1 database queries, blocking synchronous loops in async handlers, memory leaks, unhandled exception paths, and API contract regressions.
                </p>
              </div>

              {/* Agent 4 */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-medium text-sm font-heading">
                    <CheckCircle2 className="w-4 h-4 text-foreground" />
                    <span>4. Report Writer &amp; Flag Parser</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium">Markdown Diffs</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Synthesizes all findings into an executive markdown review report, structures actionable line-by-line flags (<code className="font-mono text-[11px] text-foreground">critical</code>, <code className="font-mono text-[11px] text-foreground">warning</code>, <code className="font-mono text-[11px] text-foreground">info</code>), and attaches drop-in diff recommendations.
                </p>
              </div>
            </div>
          </section>

          {/* ── 4. Webhooks & GitHub Events ── */}
          <section id="webhooks" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <Cpu className="w-5 h-5 text-foreground" />
              <h2>Webhooks &amp; GitHub Events</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              PRism provides a secured webhook receiver mounted at <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs text-foreground">POST /api/webhooks/github</code>.
            </p>

            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-medium font-heading text-foreground">HMAC-SHA256 Signature Verification</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border font-medium">x-hub-signature-256</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Incoming requests are validated using <code className="font-mono text-xs text-foreground">x-hub-signature-256</code> against your configured <code className="font-mono text-xs text-foreground">GITHUB_WEBHOOK_SECRET</code>. Requests with missing or forged signatures are rejected with HTTP 401 Unauthorized.
              </p>

              <div className="pt-2">
                <h4 className="text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
                  Supported GitHub Webhook Events
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="font-mono font-medium text-foreground shrink-0">pull_request:</span>
                    <span className="text-muted-foreground font-sans">
                      Listens for <code className="font-mono text-[11px] text-foreground">opened</code>, <code className="font-mono text-[11px] text-foreground">reopened</code>, and <code className="font-mono text-[11px] text-foreground">synchronize</code> actions. Immediately queues <code className="font-mono text-[11px] text-foreground">analyze_pr_task</code> in Celery.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="font-mono font-medium text-foreground shrink-0">pull_request_review_comment:</span>
                    <span className="text-muted-foreground font-sans">
                      Listens for <code className="font-mono text-[11px] text-foreground">created</code> replies on PRism comments. Queues <code className="font-mono text-[11px] text-foreground">respond_to_comment_task</code> to converse with the developer.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border">
                    <span className="font-mono font-medium text-foreground shrink-0">issue_comment:</span>
                    <span className="text-muted-foreground font-sans">
                      Listens for direct mentions (<code className="font-mono text-[11px] text-foreground">@prism</code>) or inquiries on pull request discussion threads.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. Interactive AI Comment Threads (Clean, Minimal, Modern Code Review Component) ── */}
          <section id="interactive-threads" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <MessageSquare className="w-5 h-5 text-foreground" />
              <h2>Interactive AI Comment Threads</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Code reviews shouldn&apos;t be a one-way lecture. When PRism flags an issue on GitHub, developers can reply directly under the comment to query context, request alternatives, or debate edge cases.
            </p>

            {/* Clean Monochromatic GitHub Review Card */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              {/* Top Bar with Thread Switcher & Status */}
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3 overflow-x-auto text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground uppercase mr-1 shrink-0 font-medium">Thread:</span>
                  {threads.map((t, idx) => (
                    <button
                      key={t.title}
                      onClick={() => {
                        setActiveThreadIndex(idx);
                        setReacted(false);
                        setCommitted(false);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                        activeThreadIndex === idx
                          ? "bg-foreground text-background font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  <span>Live on GitHub</span>
                </div>
              </div>

              {/* GitHub File Annotation */}
              <div className="px-4 sm:px-5 py-2.5 bg-muted/20 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{currentThread.file}</span>
                  <span className="text-muted-foreground">:{currentThread.lines}</span>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">github review thread</span>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5">
                {/* 1. Developer Comment */}
                <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-foreground">
                        @{currentThread.engineer.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted border border-border text-muted-foreground">
                        {currentThread.engineer.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">{currentThread.engineer.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                    &quot;{currentThread.engineer.question}&quot;
                  </p>
                </div>

                {/* 2. PRism AI [bot] Reply Bubble (Minimal, Modern, High-Contrast) */}
                <div className="rounded-lg border border-border bg-card p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-foreground" />
                      <span className="font-mono font-medium text-foreground">
                        PRism AI [bot]
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
                        · {currentThread.aiResponse.model}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {currentThread.aiResponse.latency} response
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
                    {currentThread.aiResponse.body}
                  </p>

                  {/* Clean Minimal Replacement Diff */}
                  <div className="rounded-md border border-border overflow-hidden bg-muted/40 font-mono text-xs">
                    <div className="px-3 py-1.5 bg-muted/60 border-b border-border text-[11px] text-muted-foreground font-medium flex justify-between">
                      <span>Suggested replacement</span>
                      <span>diff</span>
                    </div>
                    <div className="p-2.5 space-y-1 font-mono text-[11.5px] leading-relaxed">
                      <div className="text-muted-foreground/80 bg-muted/60 px-2 py-1 rounded">
                        <pre className="whitespace-pre-wrap">{currentThread.aiResponse.diffBefore}</pre>
                      </div>
                      <div className="text-foreground bg-muted px-2 py-1 rounded">
                        <pre className="whitespace-pre-wrap">{currentThread.aiResponse.diffAfter}</pre>
                      </div>
                    </div>
                  </div>

                  {/* Minimal Action Bar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCommitted(!committed)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs font-medium transition-all cursor-pointer ${
                          committed
                            ? "bg-foreground text-background"
                            : "bg-foreground text-background hover:opacity-90"
                        }`}
                      >
                        {committed ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{committed ? "Committed" : "Commit suggestion"}</span>
                      </button>

                      <button
                        onClick={() => setReacted(!reacted)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{reacted ? "👍 3" : "👍 2"}</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground">
                      Thread status: active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 6. .prism.yaml Specification ── */}
          <section id="configuration" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <Settings className="w-5 h-5 text-foreground" />
              <h2>.prism.yaml Specification</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Place a <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs text-foreground">.prism.yaml</code> in the root of your repository to tune review rules, tone, and file filters. If omitted, the defaults validated in <code className="font-mono text-xs text-foreground">backend/tools/config_parser.py</code> are automatically applied.
            </p>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-muted/40 border-b border-border text-xs font-mono">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <FileCode className="w-4 h-4 text-muted-foreground" />
                  <span>.prism.yaml (Production Reference)</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
`# .prism.yaml Configuration
review:
  auto_approve_if_no_critical: true
  comment_on_every_file: false
  critical_threshold: 1
  tone: "professional" # "professional" | "friendly" | "concise"
  include_code_suggestions: true
  include_explanations: true
  enable_interactive_responses: true
  response_wait_time: 2

ignore_patterns:
  - "*.test.js"
  - "*.test.ts"
  - "*.spec.js"
  - "*.spec.ts"
  - "**/__tests__/**"
  - "**/__mocks__/**"
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/build/**"
  - "*.min.js"
  - "*.min.css"
  - "package-lock.json"
  - "yarn.lock"

focus_areas:
  - security
  - performance
  - best_practices
  - error_handling`,
                      "yaml"
                    )
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border hover:bg-muted text-foreground transition-colors cursor-pointer text-[11px]"
                >
                  {copiedKey === "yaml" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "yaml" ? "Copied" : "Copy YAML"}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 bg-muted/20 text-foreground overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed">
                <pre>
                  <code>{`# Review behavior configuration
review:
  # Automatically approve PRs when 0 critical issues exist
  auto_approve_if_no_critical: true

  # Comment on every file or only files with findings
  comment_on_every_file: false

  # Number of critical findings needed to trigger REQUEST_CHANGES
  critical_threshold: 1

  # Review personality tone: "professional", "friendly", or "concise"
  tone: "professional"

  # Include concrete replacement code diffs in review comments
  include_code_suggestions: true

  # Include technical rationale explaining why the issue matters
  include_explanations: true

  # Enable AI to respond when developers reply to review comments
  enable_interactive_responses: true

  # Delay in seconds before AI responds to comments (default: 2)
  response_wait_time: 2

# Glob patterns to bypass from AI inspection
ignore_patterns:
  - "*.test.js"
  - "*.test.ts"
  - "*.spec.js"
  - "*.spec.ts"
  - "**/__tests__/**"
  - "**/__mocks__/**"
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/build/**"
  - "*.min.js"
  - "*.min.css"
  - "package-lock.json"
  - "yarn.lock"

# Focus areas for review filtering
focus_areas:
  - security
  - performance
  - best_practices
  - error_handling`}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* ── 7. Auto-Approval & Gates ── */}
          <section id="auto-approve" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <CheckCircle2 className="w-5 h-5 text-foreground" />
              <h2>Auto-Approval &amp; Gates</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              PRism calculates a definitive GitHub review verdict based on the severity of parsed flags and your <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs text-foreground">.prism.yaml</code> policy thresholds:
            </p>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 font-mono text-[11px] text-muted-foreground">
                    <th className="p-3.5 sm:p-4">Verdict State</th>
                    <th className="p-3.5 sm:p-4">Condition</th>
                    <th className="p-3.5 sm:p-4">GitHub Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-sans">
                  <tr>
                    <td className="p-3.5 sm:p-4">
                      <span className="font-mono font-medium text-foreground px-2 py-0.5 rounded border border-border bg-muted">
                        REQUEST_CHANGES
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      Critical findings count &ge; <code className="font-mono text-xs text-foreground">critical_threshold</code> (default: 1)
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      Blocks branch protection merging until issues are resolved.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4">
                      <span className="font-mono font-medium text-foreground px-2 py-0.5 rounded border border-border bg-muted">
                        APPROVE
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      0 critical or high findings AND <code className="font-mono text-xs text-foreground">auto_approve_if_no_critical: true</code>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      Submits formal PR approval to satisfy required review rules.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3.5 sm:p-4">
                      <span className="font-mono font-medium text-foreground px-2 py-0.5 rounded border border-border bg-muted">
                        COMMENT
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      Warnings, architectural suggestions, or auto-approval disabled
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      Leaves non-blocking line annotations with executable diffs.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ── 8. Slack Notifications ── */}
          <section id="notifications" className="scroll-mt-24 space-y-5">
            <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-medium font-heading text-foreground">
              <Bell className="w-5 h-5 text-foreground" />
              <h2>Slack Notifications</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Connect your team&apos;s Slack channels to receive instant notifications when PRism completes an analysis.
            </p>

            <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-medium font-heading text-foreground">Configuring Slack Webhook</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                In your repository settings or via API endpoint <code className="font-mono text-xs text-foreground">PATCH /api/repos/&#123;repo_id&#125;/settings</code>, configure your incoming Slack webhook URL:
              </p>

              <div className="rounded-lg border border-border overflow-hidden bg-muted/30 font-mono text-xs">
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border text-[11px] text-muted-foreground">
                  <span>cURL Endpoint</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -X PATCH http://localhost:8000/api/repos/<REPO_ID>/settings \\\n  -H "Content-Type: application/json" \\\n  -d '{"slack_webhook_url": "https://hooks.slack.com/services/T00/B00/XXXX"}'`,
                        "slack"
                      )
                    }
                    className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedKey === "slack" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "slack" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-3 text-foreground overflow-x-auto leading-relaxed">
                  <code>{`curl -X PATCH http://localhost:8000/api/repos/<REPO_ID>/settings \\
  -H "Content-Type: application/json" \\
  -d '{"slack_webhook_url": "https://hooks.slack.com/services/T00/B00/XXXX"}'`}</code>
                </div>
              </div>

              {/* Minimal Slack Notification Card */}
              <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 text-xs font-sans text-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-foreground text-background font-bold flex items-center justify-center text-[10px]">
                    PR
                  </div>
                  <span className="font-medium text-foreground text-[12px]">PRism Bot</span>
                  <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded border border-border">APP</span>
                  <span className="text-[10px] text-muted-foreground font-mono">12:42 PM</span>
                </div>
                <div className="border-l-2 border-foreground pl-3 py-0.5 space-y-1">
                  <div className="font-medium text-foreground">
                    PR #142 Passed Review: <span className="font-normal text-muted-foreground">0 Critical Issues</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Repository: <span className="text-foreground font-mono">org/payments-api</span> · Branch: <span className="text-foreground font-mono">feat/fast-checkout</span>
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      Approved &amp; Ready to Merge
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <AppFooter />
    </div>
  );
}
