"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { LegalAcknowledgement } from "@/components/app/legal-acknowledgement";
import { ProtectedPage } from "@/components/app/protected-page";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";

export default function CompliancePage() {
  const { settings, refreshUser } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    refreshUser().catch(() => undefined);
  }, [refreshUser]);

  return (
    <ProtectedPage roles={["Admin", "Analyst"]}>
      <div className="space-y-6">
        <LegalAcknowledgement />
        <PageHeader title="Compliance & legal" subtitle="Review source policy documents, track acknowledgement state, and keep organization-level trust settings current." />
        {searchParams.get("required") === "1" ? (
          <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-400/15 dark:bg-amber-500/10">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Terms of Service and Privacy Policy acknowledgement is required before using the protected workspace.
            </p>
          </Card>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card title="Document library" description="Static policy pages rendered from the provided source documents.">
            <div className="space-y-3">
              {[
                ["/legal/terms", "Terms of Service"],
                ["/legal/privacy", "Privacy Policy"],
                ["/legal/security", "Security & Compliance Statement"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="flex items-center justify-between rounded-[1.5rem] border border-ink-200/70 px-4 py-4 text-sm font-medium text-ink-800 hover:bg-ink-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
                  <span>{label}</span>
                  <span className="text-ink-400">Open</span>
                </Link>
              ))}
            </div>
          </Card>
          <Card title="Acknowledgement status" description="Stored timestamps are organization-level and contain no claim-level information.">
            <div className="space-y-4 text-sm text-ink-600 dark:text-ink-300">
              <p>Terms acknowledged: {settings?.terms_acknowledged_at ? new Date(settings.terms_acknowledged_at).toLocaleString() : "Pending"}</p>
              <p>Privacy acknowledged: {settings?.privacy_policy_acknowledged_at ? new Date(settings.privacy_policy_acknowledged_at).toLocaleString() : "Pending"}</p>
              <p>Security / HIPAA acknowledgement: {settings?.hipaa_acknowledged_at ? new Date(settings.hipaa_acknowledged_at).toLocaleString() : "Pending"}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={async () => {
                await api.acknowledgeCompliance({ acknowledge_terms: true, acknowledge_privacy: true });
                await refreshUser();
              }}>
                Acknowledge terms and privacy
              </Button>
              <Button variant="secondary" onClick={async () => {
                await api.acknowledgeCompliance({ acknowledge_hipaa: true });
                await refreshUser();
              }}>
                Acknowledge security / HIPAA note
              </Button>
            </div>
          </Card>
        </div>
        <Card title="BAA workflow" description="A Business Associate Agreement flow can be activated when a BAA document and execution process are provided.">
          <p className="text-sm leading-6 text-ink-500 dark:text-ink-300">
            No BAA source document is currently attached, so this section is intentionally limited to a readiness placeholder. Once a BAA document is available, Admin users can view, download, acknowledge, and track organization status here.
          </p>
        </Card>
      </div>
    </ProtectedPage>
  );
}
