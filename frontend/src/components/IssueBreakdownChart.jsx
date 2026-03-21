function LegendRow({ label, value, colorClass }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${colorClass}`} />
        <span className="text-sm text-ink-500 dark:text-ink-300">{label}</span>
      </div>
      <span className="text-sm font-semibold text-ink-900 dark:text-white">{value}%</span>
    </div>
  );
}

export default function IssueBreakdownChart({ items, total }) {
  const resolvedItems = items.length > 0
    ? items
    : [
        { label: "New", value: 0, percentage: 0, colorClass: "bg-brand-700" },
        { label: "Reviewed", value: 0, percentage: 0, colorClass: "bg-brand-500" },
        { label: "Resolved", value: 0, percentage: 0, colorClass: "bg-brand-300" },
      ];

  let runningTotal = 0;
  const segments = resolvedItems.map((item, index) => {
    const start = runningTotal;
    runningTotal += item.percentage;
    const tailwindVar = index === 0 ? "var(--color-brand-700)" : index === 1 ? "var(--color-brand-500)" : "var(--color-brand-300)";
    return `${tailwindVar} ${start}% ${runningTotal}%`;
  }).join(", ");

  return (
    <section className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink-900 dark:text-white">Issue Breakdown</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-300">Workflow status mix across the current flagged review queue.</p>
      </div>

      {total === 0 ? (
        <p className="text-sm text-ink-500 dark:text-ink-300">No flagged records yet.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-full" style={{ background: `conic-gradient(${segments})` }}>
            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white text-center shadow-card dark:bg-ink-950">
              <strong className="text-4xl font-semibold text-ink-900 dark:text-white">{total}</strong>
              <span className="mt-1 text-sm text-ink-500 dark:text-ink-300">Active flags</span>
            </div>
          </div>
          <div className="space-y-4">
            {resolvedItems.map((item) => (
              <LegendRow key={item.label} label={item.label} value={item.percentage} colorClass={item.colorClass} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
