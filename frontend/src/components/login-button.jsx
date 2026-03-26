"use client";

import { createClient } from "@/lib/supabase/client";
import { Github } from "lucide-react";

export function LoginButton({ size = "default", variant = "default" }) {
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
    "inline-flex items-center justify-center gap-2.5 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    default: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const variants = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25",
    outline:
      "border border-border/60 bg-transparent text-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/10",
  };

  return (
    <button
      onClick={handleLogin}
      className={`${base} ${sizes[size] ?? sizes.default} ${variants[variant] ?? variants.default}`}
    >
      <Github className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
      Continue with GitHub
    </button>
  );
}
