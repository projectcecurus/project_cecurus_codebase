import { useEffect, useMemo, useState } from "react";

import { api, createEmptyDashboard } from "./api";
import AnalyticsSummaryCards from "./components/AnalyticsSummaryCards";
import IssueBreakdownChart from "./components/IssueBreakdownChart";
import RuleChartCard from "./components/RuleChartCard";
import TopNav from "./components/TopNav";
import ThemeSwitch from "./ThemeSwitch";


function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function AggregateMetrics({ dashboard }) {
  const rows = [
    {
      label: "Total Claims Processed",
      value: dashboard.metrics.total_claims_processed,
      helper: "Current parsed dataset in review",
    },
    {
      label: "Total Flags Created",
      value: dashboard.metrics.total_flags_created,
      helper: "Records currently surfaced by detection",
    },
    {
      label: "Rule Categories Hit",
      value: Object.keys(dashboard.metrics.flags_by_rule_type).length,
      helper: "Distinct duplicate rules triggered",
    },
    {
      label: "Workflow States Used",
      value: Object.keys(dashboard.metrics.flags_by_workflow_status).length,
      helper: "Statuses active in the queue right now",
    },
  ];

  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div>
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Aggregate Metrics</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">High-level operational totals for the current dataset.</p>
      </div>
      <div className="mt-6 divide-y divide-ink-200/70 dark:divide-white/10">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-4">
            <div>
              <strong className="block text-base font-semibold text-ink-900 dark:text-white">{row.label}</strong>
              <span className="mt-1 block text-sm text-ink-500 dark:text-ink-300">{row.helper}</span>
            </div>
            <span className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BreakdownModule({ title, items, emptyMessage }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div>
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Live distribution across the records currently loaded into the dashboard.</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500 dark:text-ink-300">{emptyMessage}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.label} className="grid gap-3 lg:grid-cols-[minmax(10rem,0.9fr)_minmax(0,1fr)_auto] lg:items-center">
              <div>
                <strong className="block text-base font-semibold text-ink-900 dark:text-white">{item.label}</strong>
                <span className="block text-sm text-ink-500 dark:text-ink-300">{item.description}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-brand-50 dark:bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300" style={{ width: `${(item.value / maxValue) * 100}%` }} />
              </div>
              <strong className="text-lg font-semibold text-ink-900 dark:text-white">{item.value}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function QueueHealthModule({ items, totalFlags }) {
  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div>
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Queue Health</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">How the current review workload is distributed across workflow states.</p>
      </div>
      {items.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500 dark:text-ink-300">No workflow activity yet. Process a file to start building review history.</p>
      ) : (
        <div className="mt-8 divide-y divide-ink-200/70 dark:divide-white/10">
          {items.map((item) => {
            const percentage = totalFlags > 0 ? Math.round((item.value / totalFlags) * 100) : 0;

            return (
              <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <strong className="block text-base font-semibold text-ink-900 dark:text-white">{item.label}</strong>
                  <span className="mt-1 block text-sm text-ink-500 dark:text-ink-300">{item.description}</span>
                </div>
                <div className="text-right">
                  <strong className="block text-2xl font-semibold text-ink-900 dark:text-white">{percentage}%</strong>
                  <span className="block text-sm text-ink-500 dark:text-ink-300">{item.value} record{item.value === 1 ? "" : "s"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RecentFlagsModule({ flags }) {
  const recentFlags = flags.slice(0, 5);

  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div>
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Recent Flags</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">A compact operational view of the latest records surfaced by the detection engine.</p>
      </div>
      {recentFlags.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500 dark:text-ink-300">No recent flags yet. Run duplicate detection to populate this table.</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-ink-200/70 dark:border-white/10">
          <div className="grid grid-cols-3 gap-4 bg-ink-50/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400 dark:bg-white/5 dark:text-ink-400">
            <span>Flag</span>
            <span>Rule</span>
            <span>Workflow</span>
          </div>
          <div className="divide-y divide-ink-200/70 dark:divide-white/10">
            {recentFlags.map((flag) => (
              <div key={flag.flag_id} className="grid gap-4 px-5 py-4 lg:grid-cols-3 lg:items-center">
                <div>
                  <strong className="block text-base font-semibold text-ink-900 dark:text-white">{flag.flag_id}</strong>
                  <span className="mt-1 block text-sm text-ink-500 dark:text-ink-300">{flag.claim_ids.length} linked claim{flag.claim_ids.length === 1 ? "" : "s"}</span>
                </div>
                <div>
                  <strong className="block text-base font-semibold text-ink-900 dark:text-white">{flag.rule_type}</strong>
                  <span className="mt-1 block text-sm text-ink-500 dark:text-ink-300">{flag.matched_identifiers.slice(0, 2).join(", ") || "No identifiers"}</span>
                </div>
                <span className="inline-flex w-fit rounded-full bg-brand-500 px-3 py-1 text-sm font-semibold text-white">{flag.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function AnalyticsPage({ currentUser, theme, onToggleTheme }) {
  const [dashboard, setDashboard] = useState(createEmptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.getDashboard({ ruleType: "All", status: "All" })
      .then(setDashboard)
      .catch((loadError) => {
        setDashboard(createEmptyDashboard());
        setError(loadError.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const ruleItems = useMemo(
    () =>
      Object.entries(dashboard.metrics.flags_by_rule_type).map(([label, value]) => ({
        label,
        value,
        description: `${value} flag${value === 1 ? "" : "s"} triggered`,
      })),
    [dashboard.metrics.flags_by_rule_type],
  );

  const workflowItems = useMemo(
    () =>
      Object.entries(dashboard.metrics.flags_by_workflow_status).map(([label, value]) => ({
        label,
        value,
        description: `${value} record${value === 1 ? "" : "s"} in this state`,
      })),
    [dashboard.metrics.flags_by_workflow_status],
  );

  const estimatedExposure = dashboard.metrics.total_flags_created * 1150;
  const preventedResubmissions = Math.max(dashboard.metrics.total_claims_processed - dashboard.metrics.total_flags_created, 0);
  const summaryItems = [
    { label: "Duplicate Claims Reduced", value: dashboard.metrics.total_flags_created, hint: "Current flagged records surfaced for review" },
    { label: "Financial Exposure", value: formatCurrency(estimatedExposure), hint: "Simple MVP proxy based on current flagged volume" },
    { label: "Claim Resubmissions Reduced", value: preventedResubmissions, hint: "Claims not currently flagged for duplicate review" },
  ];
  const donutItems = workflowItems.map((item, index) => ({
    ...item,
    colorClass: index === 0 ? "bg-brand-700" : index === 1 ? "bg-brand-500" : "bg-brand-300",
    percentage: dashboard.metrics.total_flags_created > 0 ? Math.round((item.value / dashboard.metrics.total_flags_created) * 100) : 0,
  }));
  const breakdownItems = ruleItems.map((item) => ({
    ...item,
    shortLabel: item.label.replace(/[^A-Z]/g, "").slice(0, 3) || item.label.slice(0, 3),
  }));

  return (
    <section className="space-y-6">
      <TopNav
        title="Analytics"
        subtitle="Deeper visibility into claims integrity operations, from aggregate metrics to rule concentration and workflow mix."
        currentUser={currentUser}
        rightSlot={<ThemeSwitch theme={theme} onToggle={onToggleTheme} />}
      />

      <AnalyticsSummaryCards items={summaryItems} />

      {loading ? <p className="text-sm text-ink-500 dark:text-ink-300">Loading analytics...</p> : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AggregateMetrics dashboard={dashboard} />
        <QueueHealthModule items={workflowItems} totalFlags={dashboard.metrics.total_flags_created} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <RuleChartCard
          title="Flagged Claims Breakdown"
          description="Visual concentration of rule hits across the currently loaded dataset."
          items={breakdownItems}
          statusValue="All Statuses"
          onStatusChange={() => {}}
          statusOptions={["All Statuses"]}
          ruleValue="All Rules"
          onRuleChange={() => {}}
          ruleOptions={["All Rules"]}
        />
        <IssueBreakdownChart items={donutItems} total={dashboard.metrics.total_flags_created} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <RecentFlagsModule flags={dashboard.flags} />
        <BreakdownModule
          title="Workflow Status Distribution"
          items={workflowItems}
          emptyMessage="No workflow states yet. Process claims to begin tracking activity."
        />
      </section>
    </section>
  );
}
