"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const supabase = createClient();

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      window.location.href = "/";
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 bg-secondary text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Sign out</span>
    </button>
  );
}
