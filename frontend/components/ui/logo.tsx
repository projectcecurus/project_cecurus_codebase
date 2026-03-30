export function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          inverse
            ? "border border-white/15 bg-white/5 text-white ring-1 ring-white/5"
            : "border border-brand-200/60 bg-brand-50 text-brand-700 ring-1 ring-brand-100"
        }`}
      >
        <span className={`text-lg font-semibold ${inverse ? "text-brand-200" : "text-brand-700"}`}>C</span>
      </div>
      {!compact ? (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${inverse ? "text-brand-200/80" : "text-brand-700"}`}>Secure</p>
          <p className={`text-lg font-semibold tracking-[0.16em] ${inverse ? "text-white" : "text-ink-950 dark:text-white"}`}>CECURUS</p>
        </div>
      ) : null}
    </div>
  );
}
