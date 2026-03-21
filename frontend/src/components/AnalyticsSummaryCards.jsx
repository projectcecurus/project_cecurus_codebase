function SummaryIcon({ children }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-card dark:bg-brand-500/15 dark:text-brand-200">
      {children}
    </div>
  );
}

function CounterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
      <path d="M6 12h12" />
      <path d="M12 6v12" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M12 9v6" />
      <path d="M15 11.5c0-1-1.3-1.5-3-1.5s-3 .5-3 1.5 1.3 1.5 3 1.5 3 .5 3 1.5-1.3 1.5-3 1.5-3-.5-3-1.5" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

function SummaryCard({ label, value, hint, icon }) {
  return (
    <article className="rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-5 shadow-card dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-4">
        <SummaryIcon>{icon}</SummaryIcon>
        <div className="min-w-0">
          <p className="text-sm text-ink-500 dark:text-ink-300">{label}</p>
          <strong className="mt-2 block text-4xl font-semibold tracking-tight text-ink-900 dark:text-white">{value}</strong>
          <p className="mt-2 text-sm text-ink-400 dark:text-ink-400">{hint}</p>
        </div>
      </div>
    </article>
  );
}

export default function AnalyticsSummaryCards({ items }) {
  const icons = [<CounterIcon key="counter" />, <MoneyIcon key="money" />, <BriefcaseIcon key="briefcase" />];

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {items.map((item, index) => (
        <SummaryCard key={item.label} {...item} icon={icons[index] ?? icons[0]} />
      ))}
    </section>
  );
}
