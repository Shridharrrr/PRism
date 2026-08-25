"use client";

import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function LogoutButton({ isOpen = true }) {
  const supabase = createClient();

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      window.location.href = "/";
    });
  };

  return (
    <button
      onClick={handleLogout}
      title={!isOpen ? "Sign out" : undefined}
      className={
        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors " +
        (!isOpen ? "justify-center px-2" : "")
      }
    >
      <LogOut className="h-5 w-5 flex-shrink-0" />
      {isOpen && <span>Sign out</span>}
    </button>
  );
}
