"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/lib/navigation";
import type { Role } from "@/lib/types";
import { Logo } from "@/components/ui/logo";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.roles.includes(role));
  const bottomHrefs = new Set(["/settings", "/compliance"]);
  const primaryItems = items.filter((item) => !bottomHrefs.has(item.href));
  const secondaryItems = items.filter((item) => bottomHrefs.has(item.href));

  return (
    <aside className="flex min-h-full flex-col overflow-hidden rounded-[2rem] bg-sidebar-gradient text-white shadow-shell">
      <div className="border-b border-white/10 px-5 pb-5 pt-6">
        <Logo inverse />
      </div>
      <nav className="mt-4 space-y-1 px-3">
        {primaryItems.map((item) => {
          const active = pathname === item.href || (item.href === "/review-session" && pathname.startsWith("/review-session"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 transition ${
                active ? "bg-brand-400/18 text-white shadow-glow ring-1 ring-white/10" : "text-white/80 hover:bg-white/8 hover:text-white"
              }`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-white/55">{item.description}</p>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 px-3 py-5">
        <nav className="space-y-1">
          {secondaryItems.map((item) => {
            const active = pathname === item.href || (item.href === "/review-session" && pathname.startsWith("/review-session"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-2xl px-4 py-3 transition ${
                  active ? "bg-brand-400/18 text-white shadow-glow ring-1 ring-white/10" : "text-white/80 hover:bg-white/8 hover:text-white"
                }`}
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-white/55">{item.description}</p>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
