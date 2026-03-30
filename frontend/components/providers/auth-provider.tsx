"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { ApiError, type OrganizationSettings, type User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  settings: OrganizationSettings | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  markAcknowledged: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEFAULT_TIMEOUT_MINUTES = 30;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef<number | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const [nextUser, nextSettings] = await Promise.all([api.me(), api.getOrganizationSettings().catch(() => null)]);
      setUser(nextUser);
      setSettings(nextSettings);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setSettings(null);
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser().catch(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const timeoutMinutes = settings?.session_timeout_minutes ?? DEFAULT_TIMEOUT_MINUTES;
    const resetTimer = () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
      idleTimer.current = window.setTimeout(async () => {
        await api.logout().catch(() => undefined);
        setUser(null);
        setSettings(null);
        router.push("/login?reason=timeout");
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();
    return () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [router, settings?.session_timeout_minutes, user]);

  useEffect(() => {
    if (!user || !settings) {
      return;
    }
    const legalBlocked =
      !settings.terms_acknowledged_at ||
      !settings.privacy_policy_acknowledged_at;
    if (legalBlocked && !pathname.startsWith("/compliance") && pathname !== "/login") {
      router.push("/compliance?required=1");
    }
  }, [pathname, router, settings, user]);

  const signIn = useCallback(async (email: string, password: string) => {
    await api.login({ email, password });
    await refreshUser();
    router.push("/dashboard");
  }, [refreshUser, router]);

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setUser(null);
    setSettings(null);
    router.push("/login");
  }, [router]);

  const markAcknowledged = useCallback(async () => {
    const nextSettings = await api.acknowledgeCompliance({
      acknowledge_terms: true,
      acknowledge_privacy: true,
    });
    setSettings(nextSettings);
  }, []);

  const value = useMemo(
    () => ({ user, settings, loading, signIn, signOut, refreshUser, markAcknowledged }),
    [loading, settings, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
