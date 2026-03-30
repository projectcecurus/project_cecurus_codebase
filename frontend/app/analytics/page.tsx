"use client";

import { useEffect, useMemo, useState } from "react";

import { ProtectedPage } from "@/components/app/protected-page";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { AggregateRun } from "@/lib/types";

function SummaryCard({ value, title, helper }: { value: string; title: string; helper: string }) {
  return (
    <div className="rounded-[1.5rem] border border-ink-200/70 bg-white px-5 py-5 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-semibold text-white shadow-glow">
          {value.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-medium leading-5 text-ink-500 dark:text-ink-300">{title}</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">{value}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">{helper}</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [runs, setRuns] = useState<AggregateRun[]>([]);

  useEffect(() => {
    api.getAggregateRuns().then(setRuns).catch(() => undefined);
  }, []);

  const totals = useMemo(() => {
    return runs.reduce(
      (accumulator, run) => {
        accumulator.flags += run.aggregates.total_duplicate_flags_detected;
        accumulator.exposure += run.aggregates.estimated_total_financial_exposure;
        accumulator.claims += run.aggregates.total_claims_processed;
        Object.entries(run.aggregates.rule_frequency_counts).forEach(([key, value]) => {
          accumulator.rules[key] = (accumulator.rules[key] ?? 0) + value;
        });
        return accumulator;
      },
      { flags: 0, exposure: 0, claims: 0, rules: {} as Record<string, number> },
    );
  }, [runs]);

  const breakdown = Object.entries(totals.rules).sort((a, b) => b[1] - a[1]);

  return (
    <ProtectedPage roles={["Admin", "Analyst"]}>
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Deeper aggregate visibility across duplicate claims, estimated exposure, and rule concentration without persisting claim-level records."
        />
        <div className="grid gap-4 xl:grid-cols-3">
          <SummaryCard value={`${totals.flags}`} title="Duplicate Claims Reduced" helper="Aggregate reviewed duplicates" />
          <SummaryCard value={`$${totals.exposure.toLocaleString()}`} title="Financial Exposure" helper="Estimated current exposure" />
          <SummaryCard value={`${Math.max(totals.claims - totals.flags, 0)}`} title="Claim Resubmissions Reduced" helper="Claims not currently flagged" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <Card title="Aggregate Metrics" description="Current roll-up totals across available aggregate processing runs.">
            <div className="divide-y divide-ink-200/70 dark:divide-white/10">
              {[
                ["Total Claims Processed", totals.claims, "Current parsed dataset in review"],
                ["Total Flags Created", totals.flags, "Aggregate duplicate findings"],
                ["Estimated Financial Exposure", `$${totals.exposure.toLocaleString()}`, "Safe financial projection"],
                ["Distinct Rule Categories", breakdown.length, "Different detection rule types triggered"],
              ].map(([label, value, helper]) => (
                <div key={String(label)} className="flex items-center justify-between gap-4 py-5">
                  <div>
                    <p className="text-lg font-semibold text-ink-950 dark:text-white">{label}</p>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{helper}</p>
                  </div>
                  <span className="text-3xl font-semibold tracking-tight text-ink-950 dark:text-white">{String(value)}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Flagged Claims Breakdown" description="Rule concentration across stored aggregate runs.">
            <div className="space-y-4">
              {breakdown.length === 0 ? (
                <p className="text-sm text-ink-500 dark:text-ink-300">No aggregate breakdown yet.</p>
              ) : (
                breakdown.map(([label, value]) => {
                  const max = breakdown[0]?.[1] ?? 1;
                  return (
                    <div key={label} className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div>
                        <p className="font-semibold text-ink-900 dark:text-white">{label}</p>
                        <div className="mt-2 h-3 rounded-full bg-brand-50 dark:bg-white/5">
                          <div className="h-3 rounded-full bg-gradient-to-r from-brand-800 via-brand-500 to-brand-300" style={{ width: `${(value / max) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-ink-900 dark:text-white">{value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
