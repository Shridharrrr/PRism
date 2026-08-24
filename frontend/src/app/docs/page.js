import { LoginButton } from "@/components/login-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search, GitBranch } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* ── Top Navbar ─────────────────────────────────────── */}
      <header className="sticky top-0 inset-x-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group" aria-label="PRism home">
              <div className="w-6 h-6 bg-foreground flex items-center justify-center transition-transform group-hover:scale-95">
                <div className="w-2.5 h-2.5 bg-background" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                PRism
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-foreground font-medium">Docs</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LoginButton variant="default" size="sm" />
          </div>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex">
        
        {/* Left Sidebar Nav */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto py-6 pr-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search docs..." 
              className="w-full bg-muted/50 border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-none"
            />
          </div>

          <nav className="space-y-6 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Introduction</h4>
              <ul className="space-y-2 border-l border-border ml-2 pl-4">
                <li><Link href="#getting-started" className="text-muted-foreground hover:text-foreground transition-colors">Getting started</Link></li>
                <li><Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-2">GitHub App</h4>
              <ul className="space-y-2 border-l border-border ml-2 pl-4">
                <li><Link href="#installation" className="text-muted-foreground hover:text-foreground transition-colors">Installation</Link></li>
                <li><Link href="#ai-agents" className="text-muted-foreground hover:text-foreground transition-colors">AI Agents</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Configuration</h4>
              <ul className="space-y-2 border-l border-border ml-2 pl-4">
                <li><Link href="#configuration" className="text-foreground font-medium border-l-2 -ml-[17px] pl-[15px] border-primary transition-colors">.prism.yaml reference</Link></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 py-8 md:py-12 px-6 md:pl-12 lg:pl-16 xl:pl-24 max-w-4xl">
          <div className="space-y-12">
            
            <header className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
                Docs
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Everything you need to get PRism automatically reviewing your pull requests.
              </p>
            </header>

            <div className="space-y-8">
              
              {/* Introduction Card */}
              <div id="getting-started" className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-5 h-5 text-foreground" />
                  <h2 className="text-xl font-semibold text-foreground">Introduction</h2>
                </div>
                <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                  <p>
                    PRism is an automated, AI-powered code review tool. It reads the diff of every pull request, inspects it against industry best practices and your repository's custom configuration, and reports concrete findings — such as security vulnerabilities, architectural anti-patterns, and logic bugs — directly as inline comments on the exact lines that cause them.
                  </p>
                  <p>
                    Unlike traditional static analysis tools, PRism understands the context of your code. Our specialized AI agents work in parallel to audit security, review architecture, and enforce code quality before you ever merge to main.
                  </p>
                </div>
              </div>

              {/* Getting Started Card */}
              <div id="installation" className="border border-border bg-card p-6 md:p-8 rounded-none shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <GitBranch className="w-5 h-5 text-foreground" />
                  <h2 className="text-xl font-semibold text-foreground">Installation & Setup</h2>
                </div>
                <div className="space-y-4 text-muted-foreground text-sm md:text-base leading-relaxed">
                  <p>Integrating PRism into your workflow takes less than 2 minutes.</p>
                  
                  <ol className="list-decimal pl-5 space-y-3 mt-4">
                    <li>
                      <strong className="text-foreground font-medium">Log into the Dashboard:</strong> Click the "Get Access" button and sign in via GitHub to access your PRism dashboard.
                    </li>
                    <li>
                      <strong className="text-foreground font-medium">Install the GitHub App:</strong> Authorize the PRism GitHub App for the repositories you wish to monitor. We request minimal permissions required to read code diffs and post inline comments.
                    </li>
                    <li>
                      <strong className="text-foreground font-medium">Open a Pull Request:</strong> That's it! Open a new pull request on any installed repository. PRism will immediately receive a webhook, analyze the diff, and post its review directly in the PR conversation.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Configuration Section */}
              <div id="configuration" className="mt-12 space-y-6">
                <h2 className="text-2xl font-light text-foreground border-b border-border pb-4">Configuration (.prism.yaml)</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You can customize PRism's review behavior on a per-repository basis by adding a <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground">.prism.yaml</code> file to the root of your repository. If no file is present, PRism uses sensible defaults.
                </p>

                <div className="border border-border bg-muted/30 p-6 overflow-x-auto shadow-sm">
                  <pre className="text-sm font-mono text-foreground leading-relaxed">
                    <code>{`# Example .prism.yaml
review:
  # Tone of the AI reviewer (professional, friendly, concise, harsh)
  tone: "professional"
  
  # Automatically approve PRs if no critical issues are found
  auto_approve: true

  # Include concrete code block suggestions in PR comments
  include_code_suggestions: true

ignore:
  # Do not run reviews on changes in these specific paths
  paths:
    - "vendor/**"
    - "node_modules/**"
    - "**/*.test.js"
    - "docs/**"
`}</code>
                  </pre>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
