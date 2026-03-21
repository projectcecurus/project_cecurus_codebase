import { useEffect, useState } from "react";

import { api, createEmptyDashboard, createEmptyFlagDetails } from "./api";
import DashboardMetrics from "./components/DashboardMetrics";
import IssueBreakdownChart from "./components/IssueBreakdownChart";
import RecentFlagsTable from "./components/RecentFlagsTable";
import RuleChartCard from "./components/RuleChartCard";
import TopNav from "./components/TopNav";
import ThemeSwitch from "./ThemeSwitch";


const RULE_TYPES = ["All", "ExactClaimDuplicate", "DuplicateServiceLinesWithinClaim", "SameClaimContentDifferentIds"];
const STATUSES = ["All", "New", "Reviewed", "Resolved", "Ignored"];

function FileActions({
  selectedFile,
  onFileChange,
  onUpload,
  onParse,
  onDetect,
  loadingAction,
  error,
  feedback,
}) {
  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <label className="block min-w-[16rem] space-y-2">
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200">837 File</span>
          <input type="file" accept=".txt,.x12,.837" onChange={onFileChange} />
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onUpload} disabled={!selectedFile || Boolean(loadingAction)} className="rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-700 disabled:opacity-60 dark:bg-white dark:text-ink-950">
            {loadingAction === "upload" ? "Uploading..." : "Upload File"}
          </button>
          <button type="button" onClick={onParse} disabled={!selectedFile || Boolean(loadingAction)} className="rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:opacity-60">
            {loadingAction === "parse" ? "Parsing..." : "Parse File"}
          </button>
          <button type="button" onClick={onDetect} disabled={!selectedFile || Boolean(loadingAction)} className="rounded-2xl border border-brand-500 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60 dark:bg-brand-500/10 dark:text-brand-200">
            {loadingAction === "detect" ? "Detecting..." : "Run Detection"}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-ink-500 dark:text-ink-300">{selectedFile ? `Selected: ${selectedFile.name}` : "Select an 837 file to start."}</p>
        {feedback ? <p className="mt-2 text-sm text-brand-600 dark:text-brand-300">{feedback}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
      </div>
    </section>
  );
}

function DetailPanel({ details, loading, error, onStatusChange, updatingStatus }) {
  if (loading) {
    return (
      <aside className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">Flag Detail</h2>
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">Loading selected record...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">Flag Detail</h2>
        <p className="mt-4 text-sm text-red-500">{error}</p>
      </aside>
    );
  }

  if (!details?.flag) {
    return (
      <aside className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-white">Flag Detail</h2>
        <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">Select a flag to inspect claim-level data stored by the backend.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-400 dark:text-ink-400">Flag Detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900 dark:text-white">{details.flag.flag_id}</h2>
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Status</span>
          <select
            value={details.flag.status}
            onChange={(event) => onStatusChange(event.target.value)}
            disabled={updatingStatus}
            className="rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            {STATUSES.filter((status) => status !== "All").map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-5 text-sm leading-6 text-ink-500 dark:text-ink-300">{details.flag.explanation}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {details.flag.matched_identifiers.map((identifier) => (
          <span key={identifier} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
            {identifier}
          </span>
        ))}
      </div>
      {details.claims.map((claim) => (
        <section key={`${details.flag.flag_id}-${claim.claim_id}`} className="mt-6 rounded-[1.5rem] border border-ink-200/70 bg-ink-50/70 p-5 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{claim.claim_id}</h3>
          <div className="mt-4 space-y-2 text-sm text-ink-500 dark:text-ink-300">
            <p>Claim Amount: {claim.claim_segment.claim_amount}</p>
            <p>Billing Provider: {claim.billing_provider.last_name_or_organization}</p>
            <p>Rendering Provider: {claim.rendering_provider.last_name_or_organization}</p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-500 dark:text-ink-300">
            {claim.service_lines.map((line) => (
              <li key={line.raw} className="rounded-2xl bg-white px-3 py-2 dark:bg-ink-950/60">
                {line.line_type} | {line.service_code} | {line.modifiers.join(", ") || "No modifiers"} | {line.claim_amount}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

export default function DashboardPage({ currentUser, theme, onToggleTheme }) {
  const [health, setHealth] = useState({ status: "checking", error: "" });
  const [dashboard, setDashboard] = useState(createEmptyDashboard);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [selectedRuleType, setSelectedRuleType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFlagId, setSelectedFlagId] = useState("");
  const [details, setDetails] = useState(createEmptyFlagDetails);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingAction, setLoadingAction] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function loadDashboard(ruleType = selectedRuleType, status = selectedStatus) {
    setDashboardLoading(true);
    setDashboardError("");
    try {
      const nextDashboard = await api.getDashboard({ ruleType, status });
      setDashboard(nextDashboard);
      if (selectedFlagId && !nextDashboard.flags.some((flag) => flag.flag_id === selectedFlagId)) {
        setSelectedFlagId("");
      }
    } catch (error) {
      setDashboard(createEmptyDashboard());
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  useEffect(() => {
    api.getHealth()
      .then((response) => setHealth({ status: response.status, error: "" }))
      .catch((error) => setHealth({ status: "down", error: error.message }));
  }, []);

  useEffect(() => {
    loadDashboard(selectedRuleType, selectedStatus);
  }, [selectedRuleType, selectedStatus]);

  useEffect(() => {
    if (!selectedFlagId) {
      setDetails(createEmptyFlagDetails());
      setDetailsError("");
      return;
    }

    setDetailsLoading(true);
    setDetailsError("");
    api.getFlagDetails(selectedFlagId)
      .then(setDetails)
      .catch((error) => {
        setDetails(createEmptyFlagDetails());
        setDetailsError(error.message);
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedFlagId]);

  async function runFileAction(action, request, successMessage) {
    if (!selectedFile) {
      setActionError("Select an 837 file before running this action.");
      setActionFeedback("");
      return;
    }

    setLoadingAction(action);
    setActionError("");
    setActionFeedback("");
    try {
      const response = await request(selectedFile);
      setActionFeedback(successMessage(response));
      if (action === "parse" || action === "detect") {
        await loadDashboard();
      }
      if (action === "detect" && response.flags.length > 0) {
        setSelectedFlagId(response.flags[0].flag_id);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setLoadingAction("");
    }
  }

  async function handleStatusChange(nextStatus) {
    if (!details.flag) {
      return;
    }

    setUpdatingStatus(true);
    setDetailsError("");
    try {
      const updatedFlag = await api.updateFlagStatus(details.flag.flag_id, nextStatus);
      setDetails((currentDetails) => ({ ...currentDetails, flag: updatedFlag }));
      setActionFeedback(`Updated ${updatedFlag.flag_id} to ${updatedFlag.status}.`);
      setActionError("");
      await loadDashboard();
    } catch (error) {
      setDetailsError(error.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  const ruleChartItems = Object.entries(dashboard.metrics.flags_by_rule_type);
  const totalStatuses = Object.values(dashboard.metrics.flags_by_workflow_status).reduce((sum, value) => sum + value, 0);
  const metricItems = [
    { label: "Total Claims Processed", value: dashboard.metrics.total_claims_processed, hint: "Current review set", tone: "soft" },
    { label: "Duplicate Flags", value: dashboard.metrics.total_flags_created, hint: "Open detections", tone: "brand" },
    { label: "Financial Exposure", value: `$${dashboard.metrics.total_flags_created * 1150}`, hint: "MVP estimate", tone: "soft" },
    { label: "Manual Reviews Reduced", value: `${Math.max(100 - dashboard.metrics.total_flags_created * 5, 0)}%`, hint: "Estimated lift", tone: "brand" },
  ];
  const chartItems = ruleChartItems.map(([label, value]) => ({
    label,
    value,
    shortLabel: label.replace(/[^A-Z]/g, "").slice(0, 3) || label.slice(0, 3),
  }));
  const workflowItems = Object.entries(dashboard.metrics.flags_by_workflow_status).map(([label, value], index) => ({
    label,
    value,
    percentage: totalStatuses > 0 ? Math.round((value / totalStatuses) * 100) : 0,
    colorClass: index === 0 ? "bg-brand-700" : index === 1 ? "bg-brand-500" : "bg-brand-300",
  }));

  return (
    <section className="space-y-6">
      <TopNav
        title="Dashboard"
        subtitle="Monitor processed claims, duplicate exposure, workflow distribution, and recent flags from the live review dataset."
        currentUser={currentUser}
        rightSlot={<ThemeSwitch theme={theme} onToggle={onToggleTheme} />}
      />

      <FileActions
        selectedFile={selectedFile}
        onFileChange={(event) => {
          setSelectedFile(event.target.files?.[0] ?? null);
          setActionError("");
          setActionFeedback("");
        }}
        onUpload={() =>
          runFileAction("upload", api.uploadFile, (response) => `Uploaded ${response.filename} (${response.size_bytes} bytes).`)
        }
        onParse={() =>
          runFileAction("parse", api.parseFile, (response) => `Parsed ${response.claim_count} claim(s) from ${response.filename}.`)
        }
        onDetect={() =>
          runFileAction(
            "detect",
            api.detectDuplicates,
            (response) => `Detection completed for ${response.filename}. ${response.flag_count} flag(s) created.`,
          )
        }
        loadingAction={loadingAction}
        error={actionError}
        feedback={actionFeedback}
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${health.status === "ok" ? "bg-brand-500 text-white" : "bg-red-500 text-white"}`}>
          Backend: {health.status}
        </span>
        {health.error ? <span className="text-sm text-red-500">{health.error}</span> : null}
      </div>

      <DashboardMetrics items={metricItems} />

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <RuleChartCard
          title="Flagged Claims by Rule"
          description="The latest distribution of rule hits in the current review window."
          items={chartItems}
          statusValue={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusOptions={STATUSES}
          ruleValue={selectedRuleType}
          onRuleChange={setSelectedRuleType}
          ruleOptions={RULE_TYPES}
        />
        <IssueBreakdownChart items={workflowItems} total={totalStatuses} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.35fr_0.95fr]">
        <RecentFlagsTable
          flags={dashboard.flags}
          selectedFlagId={selectedFlagId}
          onSelect={setSelectedFlagId}
          loading={dashboardLoading}
          error={dashboardError}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          statusOptions={STATUSES}
          selectedRuleType={selectedRuleType}
          onRuleTypeChange={setSelectedRuleType}
          ruleOptions={RULE_TYPES}
        />
        <DetailPanel
          details={details}
          loading={detailsLoading}
          error={detailsError}
          onStatusChange={handleStatusChange}
          updatingStatus={updatingStatus}
        />
      </section>

      <p className="text-center text-sm text-ink-400 dark:text-ink-400">© 2026 Cecurus. All rights reserved.</p>
    </section>
  );
}
