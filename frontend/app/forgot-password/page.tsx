"use client";

import { FormEvent, useState } from "react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await api.requestPasswordReset(email);
    setMessage(response.message);
    setToken(response.reset_token);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card title="Reset password" description="Request a reset token for your organization account. Keep the returned token secure.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Work email" required />
          <Button className="w-full">Request reset</Button>
        </form>
        {message ? <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">{message}</p> : null}
        {token ? (
          <p className="mt-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
            Reset token: <span className="font-mono">{token}</span>
          </p>
        ) : null}
      </Card>
    </main>
  );
}
