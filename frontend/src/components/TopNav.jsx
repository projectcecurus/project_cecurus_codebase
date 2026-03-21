export default function TopNav({ title, subtitle, currentUser, rightSlot }) {
  return (
    <div className="flex flex-col gap-6 border-b border-ink-200/70 pb-6 dark:border-white/10 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900 dark:text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-300">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        {rightSlot}
        <div className="hidden items-center gap-3 rounded-3xl border border-ink-200 bg-white/80 px-4 py-3 shadow-card dark:border-white/10 dark:bg-white/5 lg:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-ink-500 dark:text-ink-300">Welcome, {currentUser?.name ?? "Tracy"}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
            {(currentUser?.name ?? "T").slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
