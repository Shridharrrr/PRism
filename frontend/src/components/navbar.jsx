import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export function Navbar({ username, avatarUrl, backHref, backLabel }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: logo + optional breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/repos" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-colors group-hover:opacity-80">
              <div className="w-4 h-4 rounded bg-background" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">
              PRism
            </span>
          </Link>

          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block">
            Analytics
          </Link>

          {backHref && backLabel && (
            <>
              <span className="text-border text-sm select-none">/</span>
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
                  className="w-8 h-8 rounded-full border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground">
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
