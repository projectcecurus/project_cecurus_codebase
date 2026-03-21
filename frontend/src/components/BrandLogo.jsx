function BrandShield({ className = "" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className}>
      <path
        d="M60 9c16 10 31 15 50 18v26c0 29-14 48-26 60-9 9-18 15-24 18-6-3-15-9-24-18C24 101 10 82 10 53V27c19-3 34-8 50-18Z"
        className="stroke-current"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M83 42c-5-8-14-13-25-13-17 0-30 13-30 31s13 31 30 31c10 0 19-4 24-12"
        className="stroke-current"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M24 60h67" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
      <circle cx="83" cy="42" r="4" className="fill-current" />
      <circle cx="83" cy="79" r="4" className="fill-current" />
    </svg>
  );
}

export default function BrandLogo({ withWordmark = false, dark = false, compact = false }) {
  const shellTone = dark ? "text-white" : "text-brand-600";
  const accentTone = dark ? "text-brand-300" : "text-brand-500";
  const wordTone = dark ? "text-white" : "text-ink-900";

  if (!withWordmark) {
    return <BrandShield className={`h-10 w-10 ${shellTone}`} />;
  }

  return (
    <div className="flex items-center gap-3">
      <BrandShield className={`${compact ? "h-10 w-10" : "h-12 w-12"} ${shellTone}`} />
      <div className={`text-xl font-semibold tracking-[0.24em] ${wordTone}`}>
        <span>CE</span>
        <span className={accentTone}>CU</span>
        <span>RUS</span>
      </div>
    </div>
  );
}
