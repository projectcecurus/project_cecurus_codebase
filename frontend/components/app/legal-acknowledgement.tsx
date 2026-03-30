"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LegalAcknowledgement() {
  const { settings, markAcknowledged, user } = useAuth();

  if (!user || !settings) {
    return null;
  }

  if (settings.terms_acknowledged_at && settings.privacy_policy_acknowledged_at) {
    return null;
  }

  return (
    <Card
      title="Policy acknowledgement required"
      description="Before continuing, review and acknowledge the Terms of Service and Privacy Policy. Acceptance is stored at the organization level without claim-level data."
      className="border-brand-200 bg-brand-50/70 dark:border-brand-400/20 dark:bg-brand-500/10"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          <Link className="rounded-full bg-white px-4 py-2 text-ink-900 hover:bg-ink-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" href="/legal/terms">
            Read Terms
          </Link>
          <Link className="rounded-full bg-white px-4 py-2 text-ink-900 hover:bg-ink-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/15" href="/legal/privacy">
            Read Privacy Policy
          </Link>
        </div>
        <Button onClick={() => markAcknowledged()}>Acknowledge and continue</Button>
      </div>
    </Card>
  );
}
