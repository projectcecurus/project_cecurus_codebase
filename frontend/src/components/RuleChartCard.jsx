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

export default function RuleChartCard({
  title,
  description,
  items,
  statusValue,
  onStatusChange,
  statusOptions,
  ruleValue,
  onRuleChange,
  ruleOptions,
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip value={statusValue} onChange={onStatusChange} options={statusOptions} label="Status filter" />
          <FilterChip value={ruleValue} onChange={onRuleChange} options={ruleOptions} label="Rule filter" />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-sm text-ink-500 dark:text-ink-300">Run duplicate detection to populate the chart.</p>
      ) : (
        <div className="mt-10 grid h-72 grid-cols-6 gap-4 sm:grid-cols-8 lg:grid-cols-10">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col justify-end gap-3">
              <div className="relative flex-1 rounded-full bg-brand-50 dark:bg-white/5">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-brand-700 via-brand-500 to-brand-300 shadow-glow"
                  style={{ height: `${Math.max((item.value / maxValue) * 100, 12)}%` }}
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[11px] font-medium text-ink-400 dark:text-ink-400">{item.shortLabel ?? item.label}</p>
                <p className="text-xs font-semibold text-ink-800 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
