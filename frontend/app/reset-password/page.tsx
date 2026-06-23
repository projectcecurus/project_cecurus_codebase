"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const guidance = [
  "At least 12 characters",
  "At least one uppercase letter",
  "At least one lowercase letter",
  "At least one number",
  "At least one special character",
];

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await api.confirmPasswordReset(token, password);
      setMessage(response.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card title="Complete password reset" description="Create a new password that meets the Project Cecurus security policy.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Reset token" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="New password" required />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button className="w-full">Update password</Button>
        </form>
        <ul className="mt-5 space-y-2 text-sm text-ink-500 dark:text-ink-300">
          {guidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {message ? <p className="mt-4 text-sm text-brand-700 dark:text-brand-300">{message}</p> : null}
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
