export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "Reviewed"
      ? "bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200"
      : value === "Resolved"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"
        : value === "Ignored"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200"
          : "bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-white";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>;
}
