"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppHeader({ user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-end gap-4 px-6">
        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 ml-3 border-l border-border">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.user_name || "User"}
                      className="w-8 h-8 rounded-full border border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block">
                    {user.user_metadata?.user_name || "User"}
                  </span>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium hover:text-foreground transition-colors"
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
