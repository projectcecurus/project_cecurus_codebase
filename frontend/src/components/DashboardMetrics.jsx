function Sparkline({ tone = "brand" }) {
  const toneClass =
    tone === "soft"
      ? "from-brand-200 via-brand-100 to-transparent dark:from-brand-300/40 dark:via-brand-200/20"
      : "from-brand-500 via-brand-400 to-transparent dark:from-brand-400 dark:via-brand-300";

  return (
    <div className="mt-4 h-3 overflow-hidden rounded-full bg-ink-100 dark:bg-white/5">
      <div className={`h-full rounded-full bg-gradient-to-r ${toneClass}`} />
    </div>
  );
}

function MetricTile({ label, value, hint, tone }) {
  return (
    <article className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-400 dark:text-ink-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-4xl font-semibold tracking-tight text-ink-900 dark:text-white">{value}</strong>
        <span className="text-xs text-ink-400 dark:text-ink-400">{hint}</span>
      </div>
      <Sparkline tone={tone} />
    </article>
  );
}

export default function DashboardMetrics({ items }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricTile key={item.label} {...item} />
      ))}
    </section>
  );
}
