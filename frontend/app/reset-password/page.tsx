"use client";

import { FormEvent, useState } from "react";

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

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await api.confirmPasswordReset(token, password);
    setMessage(response.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-100 px-4 py-10 dark:bg-ink-950">
      <Card title="Complete password reset" description="Create a new password that meets the Project Cecurus security policy.">
        <form className="space-y-4" onSubmit={onSubmit}>
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Reset token" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="New password" required />
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
