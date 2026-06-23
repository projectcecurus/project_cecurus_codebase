import Image from "next/image";
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
            <div className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] border border-white/8 bg-[radial-gradient(circle_at_70%_20%,rgba(103,212,192,0.18),transparent_24%),radial-gradient(circle_at_30%_70%,rgba(39,185,162,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]">
              <Image
                src="/assets/landing-hero-security.png"
                alt="Healthcare security interface visual"
                fill
                priority
                className="object-cover object-center opacity-80 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,46,43,0.72),rgba(8,74,65,0.28)_42%,rgba(8,129,114,0.18)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(120,255,224,0.12),transparent_24%),radial-gradient(circle_at_82%_28%,rgba(255,255,255,0.1),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(6,46,43,0),rgba(6,46,43,0.45)_55%,rgba(6,46,43,0.72))]" />
              <div className="absolute bottom-8 left-8 flex max-w-[16rem] flex-col gap-3">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/8 px-5 py-4 text-sm font-medium leading-5 text-white/84 backdrop-blur-md">
                  Secure Claims Review
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/7 px-5 py-4 text-sm font-medium leading-5 text-white/84 backdrop-blur-md">
                  Zero Data parsed
                </div>
              </div>
              <div className="absolute bottom-8 right-8 flex max-w-[16rem] flex-col gap-3">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/7 px-5 py-4 text-sm font-medium leading-5 text-white/84 backdrop-blur-md">
                  Run local reviews
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/7 px-5 py-4 text-sm font-medium leading-5 text-white/84 backdrop-blur-md">
                  Compile claims with confidence
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,32,29,0.3),rgba(2,32,29,0.45))] px-8 py-8 backdrop-blur lg:px-16">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                ["Detect Duplicate Claims", "Identify duplicate and overlapping claims before they're sent.", "/assets/icon-detect.png", "Duplicate claim detection icon"],
                ["Reduce Admin Waste", "Prevent costly claim errors and reduce resubmissions.", "/assets/icon-admin-waste.png", "Administrative waste reduction icon"],
                ["Maintain Data Privacy", "Keep all protected health information securely on-premise.", "/assets/icon-privacy.png", "Data privacy icon"],
              ].map(([title, copy, iconSrc, iconAlt]) => (
                <div key={title} className="flex gap-4 rounded-[1.5rem] border border-white/8 bg-white/4 px-5 py-5">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-brand-300/35 bg-white/90 shadow-[0_10px_25px_rgba(3,30,27,0.12)]">
                    <Image src={iconSrc} alt={iconAlt} width={56} height={56} className="h-full w-full object-cover" />
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
              <span>© 2026 Cecurus. All rights reserved</span>
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
