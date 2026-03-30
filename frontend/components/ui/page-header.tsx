import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-ink-200/70 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-300">Project Cecurus</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-950 dark:text-white">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-500 dark:text-ink-300">{subtitle}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
