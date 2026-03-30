"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import type { Role } from "@/lib/types";

export function ProtectedPage({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!loading && user && roles && !roles.includes(user.role)) {
      router.replace("/access-denied");
    }
  }, [loading, roles, router, user]);

  if (loading || !user || (roles && !roles.includes(user.role))) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-3xl border border-ink-200 bg-white px-6 py-5 text-sm text-ink-500 shadow-card dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
          Loading secure workspace...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
