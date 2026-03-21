import { useEffect, useState } from "react";

import { dashboardResponse, flagDetails } from "./mockData";

const RULE_TYPES = ["All", "ExactClaimDuplicate", "DuplicateServiceLinesWithinClaim", "SameClaimContentDifferentIds"];
const STATUSES = ["All", "New", "Reviewed", "Resolved", "Ignored"];
const EMPTY_FLAG_DETAILS = { flag: null, claims: [] };

function buildDashboardQuery(ruleType, status) {
  const params = new URLSearchParams();
  if (ruleType !== "All") {
    params.set("rule_type", ruleType);
  }
  if (status !== "All") {
    params.set("status", status);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchDashboard(ruleType, status) {
  try {
    const response = await fetch(`/api/files/review/dashboard${buildDashboardQuery(ruleType, status)}`);
    if (!response.ok) {
      throw new Error("Dashboard request failed");
    }
    return response.json();
  } catch {
    return dashboardResponse;
  }
}

async function fetchFlagDetails(flagId) {
  try {
    const response = await fetch(`/api/files/review/flags/${flagId}`);
    if (!response.ok) {
      throw new Error("Flag details request failed");
    }
    return response.json();
  } catch {
    return flagDetails[flagId] ?? EMPTY_FLAG_DETAILS;
  }
}

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DetailPanel({ details }) {
  if (!details?.flag) {
    return (
      <aside className="detail-panel empty">
        <h2>Flag Detail</h2>
        <p>Select a flag to inspect claim-level data stored locally.</p>
      </aside>
    );
  }

  return (
    <aside className="detail-panel">
      <h2>{details.flag.flag_id}</h2>
      <p>{details.flag.explanation}</p>
      <div className="chip-row">
        {details.flag.matched_identifiers.map((identifier) => (
          <span key={identifier} className="chip">
            {identifier}
          </span>
        ))}
      </div>
      {details.claims.map((claim) => (
        <section key={claim.claim_id} className="claim-card">
          <h3>{claim.claim_id}</h3>
          <p>Claim Amount: {claim.claim_segment.claim_amount}</p>
          <p>Billing Provider: {claim.billing_provider.last_name_or_organization}</p>
          <p>Rendering Provider: {claim.rendering_provider.last_name_or_organization}</p>
          <ul>
            {claim.service_lines.map((line) => (
              <li key={line.raw}>
                {line.line_type} | {line.service_code} | {line.modifiers.join(", ") || "No modifiers"} | {line.claim_amount}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

export default function App() {
  const [dashboard, setDashboard] = useState(dashboardResponse);
  const [selectedRuleType, setSelectedRuleType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedFlagId, setSelectedFlagId] = useState("");
  const [details, setDetails] = useState(EMPTY_FLAG_DETAILS);

  useEffect(() => {
    fetchDashboard(selectedRuleType, selectedStatus).then(setDashboard);
  }, [selectedRuleType, selectedStatus]);

  useEffect(() => {
    if (!selectedFlagId) {
      setDetails(EMPTY_FLAG_DETAILS);
      return;
    }
    fetchFlagDetails(selectedFlagId).then(setDetails);
  }, [selectedFlagId]);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Cecurus</p>
          <h1>Local Claims Review Dashboard</h1>
          <p>PHI stays local. Review duplicate flags, rule hits, and workflow state from the MVP parser and detection engine.</p>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard label="Total Claims Processed" value={dashboard.metrics.total_claims_processed} />
        <MetricCard label="Total Flags Created" value={dashboard.metrics.total_flags_created} />
        <MetricCard label="Rule Types Hit" value={Object.keys(dashboard.metrics.flags_by_rule_type).length} />
        <MetricCard label="Workflow States Used" value={Object.keys(dashboard.metrics.flags_by_workflow_status).length} />
      </section>

      <section className="controls">
        <label>
          Rule Type
          <select value={selectedRuleType} onChange={(event) => setSelectedRuleType(event.target.value)}>
            {RULE_TYPES.map((ruleType) => (
              <option key={ruleType} value={ruleType}>
                {ruleType}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="content-grid">
        <div className="table-panel">
          <div className="panel-header">
            <h2>Flagged Records</h2>
            <p>Simple local table for review workflow triage.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Flag ID</th>
                <th>Rule Type</th>
                <th>Claim IDs</th>
                <th>Identifiers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.flags.map((flag) => (
                <tr key={flag.flag_id} onClick={() => setSelectedFlagId(flag.flag_id)}>
                  <td>{flag.flag_id}</td>
                  <td>{flag.rule_type}</td>
                  <td>{flag.claim_ids.join(", ")}</td>
                  <td>{flag.matched_identifiers.join(", ")}</td>
                  <td>{flag.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DetailPanel details={details} />
      </section>
    </main>
  );
}
