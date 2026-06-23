"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ProtectedPage } from "@/components/app/protected-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { api } from "@/lib/api";
import type { ReviewFlag, ReviewSession } from "@/lib/types";

type SessionNoteState = {
  assignee: string;
  comment: string;
  history: string[];
};

const statusOptions: ReviewFlag["status"][] = ["New", "Reviewed", "Resolved", "Ignored"];

function ReviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") ?? "";
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRule, setSelectedRule] = useState("All");
  const [sortBy, setSortBy] = useState<"status" | "rule_type">("status");
  const [notes, setNotes] = useState<Record<string, SessionNoteState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("No active review session found.");
      return;
    }
    api
      .getReviewSession(sessionId)
      .then(setSession)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Unable to load review session."))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const visibleFlags = useMemo(() => {
    const base = session?.flags ?? [];
    return [...base]
      .filter((flag) => (selectedStatus === "All" ? true : flag.status === selectedStatus))
      .filter((flag) => (selectedRule === "All" ? true : flag.rule_type === selectedRule))
      .sort((left, right) => left[sortBy].localeCompare(right[sortBy]));
  }, [selectedRule, selectedStatus, session?.flags, sortBy]);

  const ruleOptions = useMemo(() => ["All", ...new Set((session?.flags ?? []).map((flag) => flag.rule_type))], [session?.flags]);

  async function updateStatus(flagId: string, status: ReviewFlag["status"]) {
    if (!sessionId) {
      return;
    }
    const next = await api.updateReviewFlag(sessionId, flagId, status);
    setSession(next);
    setNotes((current) => ({
      ...current,
      [flagId]: {
        assignee: current[flagId]?.assignee ?? "",
        comment: current[flagId]?.comment ?? "",
        history: [...(current[flagId]?.history ?? []), `Status updated to ${status} at ${new Date().toLocaleTimeString()}`],
      },
    }));
  }

  async function discardSession() {
    if (!sessionId) {
      return;
    }
    await api.discardReviewSession(sessionId);
    router.push("/run-review?ended=1");
  }

  return (
    <ProtectedPage roles={["Admin", "Reviewer"]}>
      <div className="space-y-6">
        <PageHeader
          title="Review session"
          subtitle="Session results are temporary. Assignment notes and comments shown here stay in the current browser session unless you explicitly recreate them."
          action={
            <Button variant="secondary" onClick={() => discardSession()}>
              End session
            </Button>
          }
        />
        {loading ? <Card><p className="text-sm text-ink-500 dark:text-ink-300">Loading active review session...</p></Card> : null}
        {error ? <Card><p className="text-sm text-red-500">{error}</p></Card> : null}
        {session ? (
          <>
            <Card title="Session overview" description="Claim-level detail is visible only for the active session and is not part of persisted reporting.">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Session expires</p>
                  <p className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">{new Date(session.metadata.expires_at).toLocaleString()}</p>
                </div>
                <div className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Flags</p>
                  <p className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">{session.metadata.aggregates.total_duplicate_flags_detected}</p>
                </div>
                <div className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Claims processed</p>
                  <p className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">{session.metadata.aggregates.total_claims_processed}</p>
                </div>
                <div className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                  <p className="text-sm text-ink-500 dark:text-ink-300">Financial exposure</p>
                  <p className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">${session.metadata.aggregates.estimated_total_financial_exposure.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card title="Filters" description="Filter and sort the active session without creating persisted claim history.">
              <div className="grid gap-4 md:grid-cols-3">
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                  <option>All</option>
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <select value={selectedRule} onChange={(event) => setSelectedRule(event.target.value)}>
                  {ruleOptions.map((rule) => (
                    <option key={rule}>{rule}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "status" | "rule_type")}>
                  <option value="status">Sort by status</option>
                  <option value="rule_type">Sort by rule</option>
                </select>
              </div>
            </Card>
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <Card title="Session flags" description="These results are live for the current session only.">
                <div className="space-y-4">
                  {visibleFlags.length === 0 ? (
                    <p className="text-sm text-ink-500 dark:text-ink-300">No flags match the current filters.</p>
                  ) : (
                    visibleFlags.map((flag) => (
                      <article key={flag.flag_id} className="rounded-[1.5rem] border border-ink-200/70 p-4 dark:border-white/10">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink-400 dark:text-ink-400">{flag.flag_id}</p>
                            <h3 className="mt-2 text-lg font-semibold text-ink-950 dark:text-white">{flag.rule_type}</h3>
                            <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-300">{flag.explanation}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {flag.matched_identifiers.map((identifier) => (
                                <span key={identifier} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                                  {identifier}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <StatusBadge value={flag.status} />
                            <select value={flag.status} onChange={(event) => updateStatus(flag.flag_id, event.target.value as ReviewFlag["status"])}>
                              {statusOptions.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </Card>
              <Card title="Reviewer workspace" description="Assignment labels, comments, and status history in this panel are session-local to stay aligned with zero-storage design.">
                <div className="space-y-5">
                  {visibleFlags.slice(0, 3).map((flag) => {
                    const note = notes[flag.flag_id] ?? { assignee: "", comment: "", history: [] };
                    return (
                      <section key={flag.flag_id} className="rounded-[1.5rem] bg-ink-100/80 p-4 dark:bg-white/5">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500 dark:text-ink-300">{flag.flag_id}</h3>
                        <div className="mt-3 space-y-3">
                          <input
                            placeholder="Assign reviewer for this browser session"
                            value={note.assignee}
                            onChange={(event) => setNotes((current) => ({ ...current, [flag.flag_id]: { ...note, assignee: event.target.value } }))}
                          />
                          <textarea
                            placeholder="Session-only comments"
                            value={note.comment}
                            onChange={(event) => setNotes((current) => ({ ...current, [flag.flag_id]: { ...note, comment: event.target.value } }))}
                          />
                          <div className="space-y-2 text-xs text-ink-500 dark:text-ink-300">
                            <p className="font-semibold uppercase tracking-[0.15em]">Status history</p>
                            {note.history.length === 0 ? <p>No local history captured yet.</p> : note.history.map((entry) => <p key={entry}>{entry}</p>)}
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </ProtectedPage>
  );
}

export default function ReviewSessionPage() {
  return (
    <Suspense fallback={null}>
      <ReviewSessionContent />
    </Suspense>
  );
}
