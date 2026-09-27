"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthenticatedLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    }

    checkUser();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 bg-background rounded-xs" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for both Desktop and Mobile */}
      <AppSidebar
        isDesktopOpen={desktopSidebarOpen}
        onDesktopOpenChange={setDesktopSidebarOpen}
        isMobileOpen={mobileMenuOpen}
        onMobileOpenChange={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-300 ease-in-out pl-0 ${
          desktopSidebarOpen ? "md:pl-64" : "md:pl-16"
        }`}
      >
        <AppHeader
          user={user}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
        <AppFooter />
      </div>
    </div>
  );
}
