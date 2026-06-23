import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link href="/" aria-label="Go to landing page" className="flex items-center gap-3">
      <div
        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl ${
          inverse
            ? "border border-white/15 bg-white ring-1 ring-white/5"
            : "border border-brand-200/60 bg-white ring-1 ring-brand-100"
        }`}
      >
        <Image
          src="/assets/cecurus-logo.png"
          alt="Cecurus logo"
          width={44}
          height={44}
          className="h-full w-full object-cover"
          priority
        />
      </div>
      {!compact ? (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${inverse ? "text-brand-200/80" : "text-brand-700"}`}>Secure</p>
          <p className={`text-lg font-semibold tracking-[0.16em] ${inverse ? "text-white" : "text-ink-950 dark:text-white"}`}>CECURUS</p>
        </div>
      ) : null}
    </Link>
  );
}
