"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";

function LoginContent() {
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card className="w-full max-w-xl">
        <Logo />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white">Secure sign in</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-300">
          Access the protected Cecurus workspace using your organization account. Sessions use secure HTTP-only authentication.
        </p>
        {searchParams.get("reason") === "timeout" ? (
          <p className="mt-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
            Your session timed out due to inactivity. Please sign in again.
          </p>
        ) : null}
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Work email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Password</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/forgot-password" className="font-medium text-brand-700 hover:text-brand-500 dark:text-brand-300">
            Forgot password?
          </Link>
          <Link href="/onboarding" className="text-ink-500 hover:text-ink-700 dark:text-ink-300">
            Register an organization
          </Link>
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
