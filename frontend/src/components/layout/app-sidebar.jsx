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

export function AppSidebar({ isOpen = true, onOpenChange }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="relative flex h-16 items-center px-4 border-b border-sidebar-border">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all duration-300",
              !isOpen && "opacity-0 hidden"
            )}
          >
            <div className="w-8 h-8 bg-sidebar-foreground flex items-center justify-center flex-shrink-0 transition-transform hover:scale-95">
              <div className="w-3 h-3 bg-sidebar" />
            </div>
            
            {isOpen && (
              <span className="font-bold text-xl tracking-tight text-sidebar-foreground whitespace-nowrap">
                PRism
              </span>
            )}
          </Link>

          <button
            onClick={() => onOpenChange?.(!isOpen)}
            className={cn(
              "w-8 h-8 bg-sidebar border border-sidebar-border rounded-none hover:bg-sidebar-accent transition-colors flex items-center justify-center shadow-sm z-50",
              isOpen ? "absolute right-3 top-4" : "mx-auto mt-4"
            )}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 text-sidebar-foreground transition-transform duration-300",
                !isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!isOpen ? item.name : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  !isOpen && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
                {isOpen && <span>{item.name}</span>}
                {!isOpen && <span className="sr-only">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 flex flex-col gap-1">
          <LogoutButton isOpen={isOpen} />
        </div>
      </div>
    </aside>
  );
}
