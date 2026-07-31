"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Home, Apple, BookOpen, Sparkles, Settings, Users, BarChart3, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { buildSearchResults } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { getDefaultRedirect, useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@/types/app";

type AppShellProps = {
  role: UserRole;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const clientLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/foods", label: "Foods", icon: Apple },
  { href: "/dashboard/meals", label: "Meals", icon: Sparkles },
  { href: "/dashboard/coach", label: "AI Coach", icon: Sparkles },
  { href: "/dashboard/learn", label: "Learn", icon: BookOpen },
  { href: "/dashboard/profile", label: "Profile", icon: Settings },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: Home },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function RoleGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hydrated, user, role: activeRole } = useAuthStore((state) => ({
    hydrated: state.hydrated,
    user: state.user,
    role: state.role,
  }));

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user || activeRole !== role) {
      router.replace(getDefaultRedirect(activeRole));
    }
  }, [activeRole, hydrated, role, router, user]);

  if (!hydrated || !user || activeRole !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(229,231,237,0.75),_rgba(237,232,245,0.8))]">
        <div className="rounded-full border border-white/60 bg-white/70 px-6 py-3 text-sm text-slate-500 backdrop-blur-xl">
          Loading your workspace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AppShell({ role, title, subtitle, children, actions }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState("");

  const links = role === "client" ? clientLinks : adminLinks;
  const results = useMemo(() => buildSearchResults(query), [query]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(229,231,237,0.86),_rgba(237,232,245,0.94))]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-[280px] shrink-0 rounded-[30px] border border-white/70 bg-white/50 p-5 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.4)] backdrop-blur-2xl lg:flex lg:flex-col">
          <Link href="/" className="rounded-[24px] bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Novaturient</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-900">
              Nutrition
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Premium exchange-based guidance with a calm clinical feel.
            </p>
          </Link>

          <nav className="mt-6 space-y-2">
            {links.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition-all hover:bg-white/60 hover:text-slate-900",
                    active && "bg-white/85 text-slate-900 shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/food-groups"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-500 transition-all hover:bg-white/60 hover:text-slate-900",
                pathname === "/food-groups" && "bg-white/85 text-slate-900 shadow-sm",
              )}
            >
              <BookOpen className="h-4 w-4" />
              Food Groups
            </Link>
          </nav>

          <div className="mt-auto rounded-[24px] bg-gradient-to-br from-white/80 via-white/55 to-white/35 p-5">
            <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-4 z-20 rounded-[30px] border border-white/70 bg-white/65 p-4 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {role === "client" ? "Client workspace" : "Dietitian workspace"}
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-900">
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">{subtitle}</p>
              </div>

              <div className="flex flex-col gap-3 lg:w-[430px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search foods, lessons, meals, or clients"
                    className="h-12 w-full rounded-full border border-white/70 bg-white/80 pl-11 pr-4 text-sm text-slate-700 outline-none backdrop-blur-xl"
                  />
                  {query && (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 rounded-[24px] border border-white/80 bg-white/90 p-3 shadow-2xl backdrop-blur-2xl">
                      <div className="space-y-1">
                        {results.length ? (
                          results.map((result) => (
                            <Link
                              key={result.id}
                              href={result.href}
                              className="block rounded-2xl px-4 py-3 text-sm transition hover:bg-[#ede8f5]/55"
                              onClick={() => setQuery("")}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium text-slate-900">{result.title}</span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                  {result.type}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500">{result.subtitle}</p>
                            </Link>
                          ))
                        ) : (
                          <p className="px-4 py-3 text-sm text-slate-500">
                            No results yet. Try a food, lesson, or client name.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {actions}
              </div>
            </div>
          </header>

          <main className="flex-1 pb-28 pt-6 lg:pb-6">{children}</main>

          <div className="fixed bottom-4 left-4 right-4 z-30 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="grid grid-cols-4 gap-2">
              {links.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] text-slate-500",
                      active && "bg-[#ede8f5] text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
