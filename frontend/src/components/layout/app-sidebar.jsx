"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  FileSearch,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Repositories", href: "/repos", icon: FolderGit2 },
  { name: "Reviews", href: "/reviews", icon: FileSearch },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({
  isDesktopOpen = true,
  onDesktopOpenChange,
  isMobileOpen = false,
  onMobileOpenChange,
}) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile Overlay Backdrop ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => onMobileOpenChange?.(false)}
        />
      )}

      {/* ── Mobile Drawer (Slide In from Left) ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border">
          <Link
            href="/dashboard"
            onClick={() => onMobileOpenChange?.(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-7 h-7 rounded-lg bg-sidebar-foreground flex items-center justify-center">
              <div className="w-3 h-3 rounded-xs bg-sidebar" />
            </div>
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
              PRism
            </span>
          </Link>
          <button
            onClick={() => onMobileOpenChange?.(false)}
            className="p-1.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onMobileOpenChange?.(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <LogoutButton isOpen={true} />
        </div>
      </aside>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 top-0 z-30 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
          isDesktopOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Top Header */}
          <div className="relative flex h-16 items-center px-4 border-b border-sidebar-border">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2.5 overflow-hidden transition-all duration-300",
                !isDesktopOpen && "opacity-0 hidden"
              )}
            >
              <div className="w-7 h-7 rounded-lg bg-sidebar-foreground flex items-center justify-center flex-shrink-0 transition-transform hover:scale-95">
                <div className="w-3 h-3 rounded-xs bg-sidebar" />
              </div>

              {isDesktopOpen && (
                <span className="font-bold text-lg tracking-tight text-sidebar-foreground whitespace-nowrap">
                  PRism
                </span>
              )}
            </Link>

            <button
              onClick={() => onDesktopOpenChange?.(!isDesktopOpen)}
              className={cn(
                "w-7 h-7 bg-sidebar border border-sidebar-border rounded-lg hover:bg-sidebar-accent transition-colors flex items-center justify-center shadow-xs z-50",
                isDesktopOpen ? "absolute right-3.5 top-4.5" : "mx-auto mt-0"
              )}
              aria-label={isDesktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 text-sidebar-foreground transition-transform duration-300",
                  !isDesktopOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 space-y-1 p-3">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={!isDesktopOpen ? item.name : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                    !isDesktopOpen && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                  {isDesktopOpen && <span>{item.name}</span>}
                  {!isDesktopOpen && <span className="sr-only">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Footer */}
          <div className="border-t border-sidebar-border p-3 flex flex-col gap-1">
            <LogoutButton isOpen={isDesktopOpen} />
          </div>
        </div>
      </aside>
    </>
  );
}
