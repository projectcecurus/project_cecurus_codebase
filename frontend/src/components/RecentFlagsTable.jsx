function FilterChip({ value, onChange, options, label }) {
  return (
    <label className="inline-flex items-center rounded-2xl border border-ink-200/70 bg-ink-50 px-3 py-2 text-xs text-ink-500 dark:border-white/10 dark:bg-white/5 dark:text-ink-300">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent pr-5 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="text-ink-900">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatRuleLabel(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export default function RecentFlagsTable({
  flags,
  selectedFlagId,
  onSelect,
  loading,
  error,
  selectedStatus,
  onStatusChange,
  statusOptions,
  selectedRuleType,
  onRuleTypeChange,
  ruleOptions,
}) {
  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Recent Flags</h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Live backend records surfaced for duplicate review.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip value={selectedStatus} onChange={onStatusChange} options={statusOptions} label="Status filter" />
          <FilterChip value={selectedRuleType} onChange={onRuleTypeChange} options={ruleOptions} label="Rule filter" />
        </div>
      </div>

      {loading ? <p className="mt-6 text-sm text-ink-500 dark:text-ink-300">Loading dashboard...</p> : null}
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      {flags.length === 0 && !loading ? (
        <p className="mt-6 text-sm text-ink-500 dark:text-ink-300">No flags yet. Upload and run duplicate detection to populate the review queue.</p>
      ) : null}

      {flags.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-200/70 dark:border-white/10">
          <div className="hidden grid-cols-[1.1fr_0.9fr_1.2fr_1.2fr_0.9fr_0.8fr] gap-4 bg-ink-50/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-ink-400 dark:bg-white/5 dark:text-ink-400 lg:grid">
            <span>Claim ID</span>
            <span>Status</span>
            <span>Identifiers</span>
            <span>Rule Triggered</span>
            <span>Claims</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-ink-200/70 dark:divide-white/10">
            {flags.map((flag) => (
              <button
                key={flag.flag_id}
                type="button"
                onClick={() => onSelect(flag.flag_id)}
                className={`grid w-full gap-3 px-5 py-5 text-left transition hover:bg-brand-50/70 dark:hover:bg-white/5 lg:grid-cols-[1.1fr_0.9fr_1.2fr_1.2fr_0.9fr_0.8fr] lg:items-center lg:px-6 ${
                  selectedFlagId === flag.flag_id ? "bg-brand-50 dark:bg-brand-500/10" : "bg-white dark:bg-transparent"
                }`}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-400 lg:hidden">Claim ID</p>
                  <p className="font-semibold text-ink-900 dark:text-white">{flag.flag_id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-400 lg:hidden">Status</p>
                  <span className="inline-flex rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">{flag.status}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-400 lg:hidden">Identifiers</p>
                  <p className="text-sm text-ink-500 dark:text-ink-300">{flag.matched_identifiers.slice(0, 2).join(", ")}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-400 lg:hidden">Rule Triggered</p>
                  <p className="text-sm text-ink-900 dark:text-white">{formatRuleLabel(flag.rule_type)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-400 lg:hidden">Claims</p>
                  <p className="text-sm text-ink-500 dark:text-ink-300">{flag.claim_ids.join(", ")}</p>
                </div>
                <div className="flex justify-start lg:justify-end">
                  <span className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 dark:border-white/10 dark:bg-white/5 dark:text-white">
                    View
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
