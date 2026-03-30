import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#efefef] px-4 py-6 dark:bg-ink-950 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <section className="overflow-hidden rounded-[2rem] bg-hero-gradient text-white shadow-shell">
          <div className="grid gap-10 px-8 pb-12 pt-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-16 lg:pb-14 lg:pt-10">
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-4">
                <Logo inverse />
                <div className="flex gap-3">
                  <Link href="/login">
                    <Button variant="secondary" className="border-white/10 bg-white/10 text-white hover:bg-white/15">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-14 max-w-xl">
                <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white lg:text-[4rem]">
                  Privacy-First
                  <br />
                  Claims Integrity
                  <br />
                  for Hospitals
                </h1>
                <p className="mt-6 max-w-lg text-xl leading-8 text-white/75">
                  Detect duplicate and overlapping healthcare claims before they leave the hospital system.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/onboarding">
                    <Button className="min-w-40 bg-brand-600 px-8 py-4 text-lg hover:bg-brand-500">Get Started</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" className="min-w-36 border-0 bg-white px-8 py-4 text-lg text-ink-900 hover:bg-ink-100">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_70%_20%,rgba(103,212,192,0.2),transparent_24%),radial-gradient(circle_at_30%_70%,rgba(39,185,162,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
              <div className="absolute inset-0">
                <div className="absolute left-14 top-28 h-28 w-56 rounded-[1.5rem] border border-white/10 bg-white/6 backdrop-blur-md" />
                <div className="absolute left-20 top-36 h-2 w-24 rounded-full bg-white/25" />
                <div className="absolute left-20 top-44 h-2 w-36 rounded-full bg-white/14" />
                <div className="absolute right-14 top-18 h-36 w-48 rounded-[1.5rem] border border-white/10 bg-white/6 backdrop-blur-md" />
                <div className="absolute right-24 top-28 h-2 w-20 rounded-full bg-white/25" />
                <div className="absolute right-24 top-36 h-2 w-28 rounded-full bg-white/14" />
                <div className="absolute bottom-12 left-1/2 h-32 w-72 -translate-x-1/2 rounded-[1.75rem] border border-white/10 bg-white/6 backdrop-blur-md" />
                <div className="absolute bottom-26 left-1/2 h-2 w-44 -translate-x-1/2 rounded-full bg-white/20" />
                <div className="absolute bottom-18 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-white/12" />
                <div className="absolute right-8 top-8 rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 text-sm text-white/75 backdrop-blur">
                  Secure review
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-72 w-64">
                  <div className="absolute inset-0 rounded-[45%] border-4 border-white/65 bg-[linear-gradient(180deg,rgba(15,100,88,0.55),rgba(7,49,43,0.2))] shadow-[0_0_60px_rgba(84,214,191,0.14)]" />
                  <div className="absolute left-1/2 top-12 h-44 w-40 -translate-x-1/2 rounded-[50%] border-[10px] border-white/75 border-b-0 border-r-0" />
                  <div className="absolute right-7 top-24 h-4 w-4 rounded-full bg-white/80" />
                  <div className="absolute bottom-12 right-12 h-4 w-4 rounded-full bg-white/80" />
                  <div className="absolute left-12 top-1/2 h-[2px] w-40 -translate-y-1/2 bg-white/70" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,32,29,0.3),rgba(2,32,29,0.45))] px-8 py-8 backdrop-blur lg:px-16">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                ["Detect Duplicate Claims", "Identify duplicate and overlapping claims before they're sent."],
                ["Reduce Admin Waste", "Prevent costly claim errors and reduce resubmissions."],
                ["Maintain Data Privacy", "Keep all protected health information securely on-premise."],
              ].map(([title, copy]) => (
                <div key={title} className="flex gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-300/35 bg-brand-400/12 text-xl text-brand-100">
                    C
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{title}</h2>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-white/70">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="-mt-4 flex justify-center">
          <div className="rounded-full border border-white/40 bg-[#234c46] px-6 py-3 text-sm text-white/75 shadow-card backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <span>© 2024 Cecurus. All rights reserved</span>
              <Link href="/legal/privacy" className="text-white/55 hover:text-white/80">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
