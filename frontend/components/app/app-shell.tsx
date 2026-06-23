"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Sidebar } from "@/components/app/sidebar";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/access-denied");

  if (!user || isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f4f6_0%,#e9edef_100%)] px-4 py-4 text-ink-900 dark:bg-ink-950 dark:text-white lg:px-8 lg:py-8">
      <div className="mx-auto grid max-w-[96rem] gap-4 lg:grid-cols-[17rem_1fr]">
        <Sidebar role={user.role} />
        <div className="rounded-[2rem] border border-white/60 bg-white/80 p-5 shadow-shell backdrop-blur dark:border-white/10 dark:bg-ink-950/70 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-ink-200/80 pb-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-ink-500 dark:text-ink-300">Organization Workspace</p>
              <p className="text-lg font-semibold text-ink-950 dark:text-white">Welcome, {user.full_name.split(" ")[0]}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <Link href="/compliance" className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-white/5">
                Compliance
              </Link>
              <Button variant="secondary" onClick={() => signOut()}>
                Logout
              </Button>
              {user.role === "Admin" ? (
                <Link
                  href="/users"
                  aria-label="Go to Manage Users"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-brand-200 to-brand-500 text-sm font-semibold text-ink-950 transition hover:scale-[1.03]"
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </Link>
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-brand-200 to-brand-500 text-sm font-semibold text-ink-950">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
