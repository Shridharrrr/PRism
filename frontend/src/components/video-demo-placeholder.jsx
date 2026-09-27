"use client";

import { useState } from "react";
import { Play, Volume2, Maximize2 } from "lucide-react";

export function VideoDemoPlaceholder() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      {/* Ambient Backlight Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/15 via-foreground/5 to-sky-500/15 rounded-3xl blur-2xl opacity-50 dark:opacity-30 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none" />

      {/* Main Video Frame */}
      <div
        id="demo"
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative aspect-video w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-neutral-950 dark:bg-black shadow-2xl overflow-hidden cursor-pointer flex flex-col justify-between p-4 sm:p-6 transition-all duration-300 group-hover:border-foreground/20"
      >
        {/* Background Grid & Abstract Interface Motif */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

          {/* Subtle Abstract UI Blueprint inside Video */}
          <div className="absolute inset-x-8 top-12 bottom-16 rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-40 font-mono text-[11px] text-neutral-400 space-y-2 hidden sm:block">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-neutral-500">
              <span>PRism // Agent Workflow Pipeline</span>
              <span>review.session.active</span>
            </div>
            <div className="space-y-1.5 pt-2 text-neutral-500">
              <p>➜ security_auditor: checking 14 files for OWASP Top 10...</p>
              <p className="text-emerald-400/80">✔ zero hardcoded secrets detected</p>
              <p className="text-amber-400/80">⚡ 1 performance optimization identified in /api/batch.ts</p>
            </div>
          </div>
        </div>

        {/* Top Video Bar */}
        <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-sans font-medium">PRism Demo Walkthrough</span>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-neutral-300">
            1080p 60fps
          </span>
        </div>

        {/* Center Big Play Button */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-1 text-black" />
          </div>
          <p className="mt-4 text-xs sm:text-sm font-medium text-white/90 tracking-wide drop-shadow-sm">
            Watch PRism in Action (1:45)
          </p>
        </div>

        {/* Bottom Video HUD Controls */}
        <div className="relative z-10 space-y-2 pt-2">
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden group-hover:h-1.5 transition-all">
            <div className="w-1/4 h-full bg-white rounded-full" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-white">0:24</span>
              <span>/</span>
              <span>1:45</span>
            </div>

            <div className="flex items-center gap-3">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400 hover:text-white transition-colors" />
              <Maximize2 className="w-3.5 h-3.5 text-neutral-400 hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
