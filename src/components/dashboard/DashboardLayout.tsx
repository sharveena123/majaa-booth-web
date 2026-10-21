import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/marketing/primitives";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";
import { DashboardWorkspaceLoader } from "@/components/dashboard/DashboardWorkspaceLoader";
import { useOrganizationContext } from "@/hooks/use-organization-context";
import { tourTargetForNavPath } from "@/hooks/use-onboarding";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean };

export function DashboardLayout({
  variant,
  nav,
  title,
  breadcrumb,
  children,
  showSearch = true,
}: {
  variant: "subscriber" | "admin";
  nav: readonly NavItem[];
  title: string;
  breadcrumb?: string;
  children: ReactNode;
  showSearch?: boolean;
}) {
  const { user, logout } = useAuth();
  const { ready: orgReady } = useOrganizationContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const openNav = () => setMobileOpen(true);
    window.addEventListener("majaa-tour-open-nav", openNav);
    return () => window.removeEventListener("majaa-tour-open-nav", openNav);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Logo />
        {variant === "admin" && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-glow">
            Superadmin
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              data-tour={tourTargetForNavPath(to)}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary-glow")} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden canvas-bg">
      {variant === "subscriber" && user?.authProvider === "firebase" && <OnboardingTour userId={user.id} />}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-deep/40 lg:block">{sidebar}</aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" data-tour="nav-menu-mobile">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-border bg-deep p-0">
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            {breadcrumb && <p className="truncate text-xs text-muted-foreground">{breadcrumb}</p>}
          </div>

          {showSearch && (
            <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground md:flex">
              <Search className="h-4 w-4 shrink-0" />
              <span className="truncate">Search…</span>
            </div>
          )}

          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-highlight animate-pulse-dot" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
                {user?.isGuest && <p className="mt-1 text-xs text-primary-glow">Guest session (mock)</p>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {variant === "subscriber" && user?.role === "superadmin" && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">Superadmin panel</Link>
                </DropdownMenuItem>
              )}
              {variant === "admin" && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Subscriber dashboard</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  void logout();
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="scrollbar-hidden relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          {variant === "subscriber" && !orgReady ? (
            <DashboardWorkspaceLoader />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
