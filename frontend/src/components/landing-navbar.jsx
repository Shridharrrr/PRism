"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LoginButton } from "@/components/login-button";
import { Menu, X, ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="PRism home">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform duration-200 group-hover:scale-95 shadow-xs">
              <div className="w-3.5 h-3.5 rounded-xs bg-background" />
            </div>
            <span className="font-semibold text-lg sm:text-xl tracking-tight text-foreground">
              PRism
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8"
          aria-label="Primary navigation"
        >
          <Link
            href="/features"
            className={`text-sm font-medium transition-colors ${
              pathname === "/features"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Features
          </Link>
          <Link
            href="/docs"
            className={`text-sm font-medium transition-colors ${
              pathname === "/docs"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Documentation
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <LoginButton size="sm" variant="default" />
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-2 px-3 rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-between"
            >
              <span>Features</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-foreground py-2 px-3 rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-between"
            >
              <span>Documentation</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <a
              href="https://github.com/Shridharrrr/PRism"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-medium text-foreground py-2 px-3 rounded-lg hover:bg-muted/80 transition-colors flex items-center justify-between"
            >
              <span>GitHub Repository</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </a>
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-3">
            <LoginButton size="lg" className="w-full justify-center" />
          </div>
        </div>
      )}
    </header>
  );
}
