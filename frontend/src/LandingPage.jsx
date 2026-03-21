import BrandLogo from "./components/BrandLogo";


function FeatureCard({ title, body, icon }) {
  return (
    <article className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-100">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
      </div>
    </article>
  );
}

function ShieldIllustration() {
  return (
    <div className="relative mx-auto h-[28rem] w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(103,212,192,0.18),transparent_28%),radial-gradient(circle_at_75%_65%,rgba(39,185,162,0.22),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />
      <div className="absolute -left-8 top-10 h-48 w-48 rounded-full border border-white/10 bg-brand-300/10 blur-xl" />
      <div className="absolute bottom-6 right-6 h-56 w-56 rounded-full border border-brand-200/10 bg-brand-500/10 blur-2xl" />
      <div className="absolute left-10 top-12 h-28 w-40 rounded-[1.5rem] border border-white/10 bg-white/6 backdrop-blur-sm" />
      <div className="absolute left-20 top-24 h-2 w-20 rounded-full bg-white/25" />
      <div className="absolute left-20 top-32 h-2 w-28 rounded-full bg-white/15" />
      <div className="absolute right-12 top-14 h-36 w-44 rounded-[1.75rem] border border-white/10 bg-white/6 backdrop-blur-sm" />
      <div className="absolute right-24 top-28 h-2 w-20 rounded-full bg-white/25" />
      <div className="absolute right-24 top-36 h-2 w-24 rounded-full bg-white/15" />
      <div className="absolute bottom-16 left-16 h-32 w-48 rounded-[1.75rem] border border-white/10 bg-white/6 backdrop-blur-sm" />
      <div className="absolute bottom-34 left-28 h-2 w-24 rounded-full bg-white/20" />
      <div className="absolute bottom-26 left-28 h-2 w-16 rounded-full bg-white/15" />
      <div className="absolute inset-x-12 top-10 h-px bg-white/10" />
      <div className="absolute inset-y-12 left-1/2 w-px -translate-x-1/2 bg-white/5" />
      <div className="absolute right-4 top-8 w-52 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60">Secure Review</p>
        <p className="mt-3 text-lg font-medium text-white">Duplicate flags surfaced before claim submission.</p>
      </div>
      <div className="absolute bottom-8 left-8 w-56 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.18em] text-white/60">Local Visibility</p>
        <p className="mt-3 text-lg font-medium text-white">Hospital-safe workflows with privacy-first controls.</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onNavigate }) {
  return (
    <main className="min-h-screen bg-ink-100 px-4 py-5 text-white dark:bg-ink-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <section className="overflow-hidden rounded-[2rem] bg-hero-gradient shadow-shell">
          <div className="grid gap-10 px-6 pb-12 pt-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:pt-10">
            <div className="flex flex-col">
              <BrandLogo withWordmark dark />
              <div className="mt-16 max-w-xl">
                <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                  Privacy-First Claims Integrity for Hospitals
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">
                  Detect duplicate and overlapping healthcare claims before they leave the hospital system.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="rounded-2xl bg-brand-500 px-8 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-brand-400"
                    onClick={() => onNavigate("/signup")}
                  >
                    Get Started
                  </button>
                  <button
                    type="button"
                    className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-ink-900 transition hover:bg-ink-100"
                    onClick={() => onNavigate("/signin")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>

            <ShieldIllustration />
          </div>

          <div className="border-t border-white/10 bg-black/10 px-6 py-8 backdrop-blur sm:px-10 lg:px-16">
            <div className="grid gap-5 lg:grid-cols-3">
              <FeatureCard
                title="Detect Duplicate Claims"
                body="Identify duplicate and overlapping claims before they are sent."
                icon={<span className="text-2xl">C</span>}
              />
              <FeatureCard
                title="Reduce Admin Waste"
                body="Prevent costly claim errors and reduce resubmissions."
                icon={<span className="text-2xl">+</span>}
              />
              <FeatureCard
                title="Maintain Data Privacy"
                body="Keep protected health information securely on-premise."
                icon={<span className="text-2xl">P</span>}
              />
            </div>
          </div>
        </section>

        <footer className="mx-auto -mt-4 flex w-fit items-center gap-4 rounded-full border border-brand-800/20 bg-brand-900/90 px-6 py-3 text-sm text-white/70 shadow-card">
          <span>© 2026 Cecurus. All rights reserved</span>
          <span className="text-white/35">|</span>
          <span>Privacy Policy</span>
        </footer>
      </div>
    </main>
  );
}
