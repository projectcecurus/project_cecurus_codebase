"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setToken("");
    try {
      const response = await api.requestPasswordReset(email.trim());
      setMessage(response.message);
      setToken(response.reset_token);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to request a reset token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card title="Request password reset" description="Generate a reset token for an existing organization admin account.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Work email" required />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Generating token..." : "Generate reset token"}
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-brand-700 dark:text-brand-300">{message}</p> : null}
        {token ? (
          <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-4 text-sm text-ink-700 dark:bg-brand-500/10 dark:text-ink-100">
            <p className="font-semibold">Local reset token</p>
            <p className="mt-2 break-all font-mono">{token}</p>
            <Link href={`/reset-password?token=${encodeURIComponent(token)}`} className="mt-3 inline-block font-semibold underline underline-offset-4">
              Continue to reset password
            </Link>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
