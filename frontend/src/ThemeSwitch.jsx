export default function ThemeSwitch({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-4 py-2 text-sm font-medium text-ink-600 shadow-card transition hover:border-brand-300 hover:text-brand-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-brand-400 dark:hover:text-white"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
        {theme === "light" ? "L" : "D"}
      </span>
      <span>{theme === "light" ? "Light" : "Dark"} mode</span>
    </button>
  );
}
