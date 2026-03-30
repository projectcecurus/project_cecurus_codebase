import type { ReactNode } from "react";

export function Card({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.75rem] border border-ink-200/70 bg-white/90 p-6 shadow-card dark:border-white/10 dark:bg-white/5 ${className}`}>
      {title ? <h2 className="text-xl font-semibold tracking-tight text-ink-950 dark:text-white">{title}</h2> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-300">{description}</p> : null}
      <div className={title || description ? "mt-6" : ""}>{children}</div>
    </section>
  );
}
