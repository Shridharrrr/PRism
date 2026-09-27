"use client";

import Link from "next/link";
import { User, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppHeader({ user, onMobileMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left section: Mobile menu button & brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="md:hidden flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-background rounded-xs" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">PRism</span>
          </Link>
        </div>

        {/* Right section: Theme toggle & user */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="flex items-center gap-2 pl-3 border-l border-border/80">
            {user ? (
              <div className="flex items-center gap-2.5">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.user_name || "User"}
                    className="w-7 h-7 rounded-full border border-border/80 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium hidden sm:inline-block text-foreground">
                  {user.user_metadata?.user_name || user.email?.split("@")[0] || "User"}
                </span>
              </div>
            ) : (
              <Link
                href="/"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
