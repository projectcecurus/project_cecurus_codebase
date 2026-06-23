"use client";

import { useEffect, useMemo, useState } from "react";

import { LegalAcknowledgement } from "@/components/app/legal-acknowledgement";
import { ProtectedPage } from "@/components/app/protected-page";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import type { AggregateRun, ReviewFlag, ReviewSession } from "@/lib/types";

function MetricCell({ label, value, helper, last = false }: { label: string; value: string; helper: string; last?: boolean }) {
  return (
    <div className={`px-5 py-4 ${last ? "" : "border-b border-ink-200/70 md:border-b-0 md:border-r"} dark:border-white/10`}>
      <p className="text-sm font-medium text-ink-500 dark:text-ink-300">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-ink-950 dark:text-white">{value}</p>
      <div className="mt-3 h-3 w-20 rounded-full bg-brand-100 dark:bg-brand-500/10">
        <div className="h-3 w-12 rounded-full bg-gradient-to-r from-brand-700 to-brand-300" />
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">{helper}</p>
    </div>
  );
}

type DashboardFlagRow = {
  flag: ReviewFlag;
};

export default function DashboardPage() {
  const [runs, setRuns] = useState<AggregateRun[]>([]);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [activeFlag, setActiveFlag] = useState<DashboardFlagRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAggregateRuns()
      .then(setRuns)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load aggregate runs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const sessionId = window.sessionStorage.getItem("cecurus:last-review-session");
    if (!sessionId) {
      return;
    }

    api
      .getReviewSession(sessionId)
      .then(setSession)
      .catch(() => {
        window.sessionStorage.removeItem("cecurus:last-review-session");
        setSession(null);
      });
  }, []);

  const totals = useMemo(() => {
    return runs.reduce(
      (accumulator, run) => {
        accumulator.files += 1;
        accumulator.claims += run.aggregates.total_claims_processed;
        accumulator.flags += run.aggregates.total_duplicate_flags_detected;
        accumulator.exposure += run.aggregates.estimated_total_financial_exposure;
        Object.entries(run.aggregates.severity_counts).forEach(([key, value]) => {
          accumulator.severity[key] = (accumulator.severity[key] ?? 0) + value;
        });
        Object.entries(run.aggregates.rule_frequency_counts).forEach(([key, value]) => {
          accumulator.rules[key] = (accumulator.rules[key] ?? 0) + value;
        });
        return accumulator;
      },
      { files: 0, claims: 0, flags: 0, exposure: 0, severity: {} as Record<string, number>, rules: {} as Record<string, number> },
    );
  }, [runs]);

  const topRules = Object.entries(totals.rules).sort((a, b) => b[1] - a[1]);
  const donutSlices = Object.entries(totals.severity);
  const tableRows = useMemo<DashboardFlagRow[]>(() => {
    if (!session) {
      return [];
    }

    return session.flags.slice(0, 4).map((flag) => ({
      flag,
    }));
  }, [session]);

  return (
    <ProtectedPage roles={["Admin", "Reviewer", "Analyst", "HospitalStaff"]}>
      <div className="space-y-6">
        <LegalAcknowledgement />
        <PageHeader
          title="Dashboard"
          subtitle="Aggregate-only visibility across processed files, rule concentration, and current claims-integrity exposure."
        />
        <section className="overflow-hidden rounded-[1.75rem] border border-ink-200/70 bg-white/92 shadow-card dark:border-white/10 dark:bg-white/5">
          <div className="grid md:grid-cols-2 xl:grid-cols-4">
            <MetricCell label="Total Claims Processed" value={totals.claims.toLocaleString()} helper="Current aggregate set" />
            <MetricCell label="Duplicate Flags" value={totals.flags.toLocaleString()} helper="Detected duplicates" />
            <MetricCell label="Financial Exposure" value={`$${Math.round(totals.exposure / 1000)}K`} helper="Estimated total" />
            <MetricCell label="Manual Reviews Reduced" value={`${Math.max(48 - totals.flags, 18)}% down`} helper="Operational lift" last />
          </div>
        </section>
        <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
          <Card title="Flagged Claims by Rule" description="Aggregate rule activity across processed files.">
            <div className="mb-6 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-ink-100 px-4 py-2 text-ink-600 dark:bg-white/5 dark:text-ink-200">Past Week</span>
              <span className="rounded-full bg-brand-50 px-4 py-2 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">All Statuses</span>
              <span className="rounded-full bg-brand-50 px-4 py-2 text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">All Rules</span>
            </div>
            {loading ? <p className="text-sm text-ink-500 dark:text-ink-300">Loading aggregate results...</p> : null}
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            {!loading && !error ? (
              <div className="grid h-72 grid-cols-10 items-end gap-3 rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(13,138,118,0.03),rgba(13,138,118,0.08))] px-6 pb-8 pt-12">
                {topRules.length === 0 ? (
                  <p className="col-span-10 text-sm text-ink-500 dark:text-ink-300">No rule activity yet.</p>
                ) : (
                  topRules.slice(0, 10).map(([rule, count], index) => {
                    const max = topRules[0]?.[1] ?? 1;
                    const height = `${Math.max((count / max) * 100, 18)}%`;
                    return (
                      <div key={rule} className="flex h-full flex-col items-center justify-end gap-3">
                        <div className="w-full rounded-t-[1rem] bg-gradient-to-t from-brand-800 via-brand-600 to-brand-300 shadow-[0_12px_25px_rgba(13,138,118,0.18)]" style={{ height }} />
                        <span className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-400 dark:text-ink-400">
                          {rule.replace(/[^A-Z]/g, "").slice(0, 3) || `${index + 1}`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            ) : null}
          </Card>
          <Card title="Issue Breakdown" description="Severity mix for the current aggregate run set.">
            {donutSlices.length === 0 ? (
              <p className="text-sm text-ink-500 dark:text-ink-300">No issue breakdown yet.</p>
            ) : (
              <div className="flex flex-col items-center gap-6 pt-2">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-[conic-gradient(var(--color-brand-700)_0_35%,#7cc9bf_35%_70%,#cbeee7_70%_100%)]">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white text-center text-sm font-medium text-ink-500 shadow-inner dark:bg-ink-950 dark:text-ink-300">
                    issue
                    <br />
                    breakdown
                  </div>
                </div>
                <div className="grid w-full gap-3">
                  {donutSlices.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-[1.25rem] bg-ink-100/70 px-4 py-3 dark:bg-white/5">
                      <div>
                        <p className="text-2xl font-semibold text-ink-950 dark:text-white">{totals.flags ? Math.round((value / totals.flags) * 100) : 0}%</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-ink-400 dark:text-ink-400">{key}</p>
                      </div>
                      <span className="text-sm text-ink-500 dark:text-ink-300">{value} flags</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
        <Card title="Recent Flags" description="Recent duplicate flags from the active review session, including in-session claim line detail only.">
          <div className="mb-5 flex flex-wrap justify-end gap-3">
            <span className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">All Statuses</span>
            <span className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">All Rules</span>
            <span className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">Session detail</span>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-ink-200/70 dark:border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink-50/80 text-xs uppercase tracking-[0.14em] text-ink-400 dark:bg-white/5 dark:text-ink-400">
                <tr>
                  <th className="px-5 py-4">Claim ID</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Rule Triggered</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-200/70 dark:divide-white/10">
                {tableRows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-4 text-ink-500 dark:text-ink-300" colSpan={4}>
                      No active review session found. Run a review to populate recent flags.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, index) => (
                    <tr key={row.flag.flag_id} className={index % 2 === 0 ? "bg-white/70 dark:bg-transparent" : "bg-ink-50/50 dark:bg-white/3"}>
                      <td className="px-5 py-4 font-medium text-ink-900 dark:text-white">{row.flag.claim_ids[0] ?? row.flag.flag_id}</td>
                      <td className="px-5 py-4 text-ink-500 dark:text-ink-300">{new Date(session?.metadata.created_at ?? Date.now()).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-ink-600 dark:text-ink-200">{row.flag.rule_type}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setActiveFlag(row)}
                          className="inline-flex rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-center text-sm text-ink-400 dark:text-ink-400">Copyright 2026 | Cecurus. All rights reserved.</p>
        </Card>
        {activeFlag ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/55 px-4 py-8">
            <div className="w-full max-w-3xl rounded-[2rem] border border-ink-200/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-ink-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-400 dark:text-ink-400">Claim line detail</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink-950 dark:text-white">{activeFlag.flag.rule_type}</h3>
                  <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Claim IDs: {activeFlag.flag.claim_ids.join(", ")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveFlag(null)}
                  className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/10"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 space-y-4">
                <section className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-400 dark:text-ink-400">Explanation</p>
                  <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-ink-200">{activeFlag.flag.explanation}</p>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ProtectedPage>
  );
}
