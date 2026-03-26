import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export function Navbar({ username, avatarUrl, backHref, backLabel }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: logo + optional breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/repos" className="flex items-center gap-2 shrink-0 group">
            <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center transition-colors group-hover:bg-primary/30">
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span className="font-semibold text-sm bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #818cf8, #c4b5fd)' }}>
              PRism
            </span>
          </Link>

          {backHref && backLabel && (
            <>
              <span className="text-border/80 text-sm select-none">/</span>
              <Link
                href={backHref}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {backLabel}
              </Link>
            </>
          )}
        </div>

        {/* Right: user info + logout */}
        <div className="flex items-center gap-3 shrink-0">
          {username && (
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-7 h-7 rounded-full border border-border/60"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary">
                  {username[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">
                @{username}
              </span>
            </div>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
