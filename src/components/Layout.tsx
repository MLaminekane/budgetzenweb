import { MainNavigation } from "./MainNavigation";
import { useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/user";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data as UserProfile);
          }
        });
    }
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden rounded-xl border-2 border-primary/20 bg-card hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-primary" />
      </Button>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300",
          "md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        <div className="p-4 flex items-center justify-between h-14 border-b">
          {!isCollapsed && <h1 className="text-xl font-bold">BudgetZen</h1>}
        </div>
        <MainNavigation isCollapsed={isCollapsed} />
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-0">
        <main className="container mx-auto p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
