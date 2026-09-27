"use client";

import { createClient } from "@/lib/supabase/client";
import { Github } from "lucide-react";

export function LoginButton({ size = "default", variant = "default", className = "" }) {
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo read:user",
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const base =
    "relative group inline-flex items-center justify-center gap-2.5 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/50 active:scale-[0.98] cursor-pointer select-none overflow-hidden";

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs font-semibold tracking-wide",
    default: "px-5 py-2.5 text-sm",
    lg: "px-6 sm:px-8 py-3.5 text-sm sm:text-base font-semibold tracking-tight",
  };

  const variants = {
    default:
      "bg-foreground text-background hover:bg-foreground/90 shadow-md shadow-black/10 dark:shadow-black/40 border border-foreground/10",
    outline:
      "border border-border/80 bg-background/80 hover:bg-muted/80 text-foreground hover:border-foreground/30 backdrop-blur-sm",
    shimmer:
      "bg-foreground text-background hover:opacity-95 shadow-lg shadow-black/10 dark:shadow-black/50 border border-foreground/20",
  };

  return (
    <button
      onClick={handleLogin}
      className={`${base} ${sizes[size] ?? sizes.default} ${variants[variant] ?? variants.default} ${className}`}
    >
      <Github className={size === "lg" ? "w-5 h-5 transition-transform group-hover:scale-110" : "w-4 h-4 transition-transform group-hover:scale-110"} />
      <span>Continue with GitHub</span>
    </button>
  );
}
