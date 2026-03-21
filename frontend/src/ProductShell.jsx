import Sidebar from "./components/Sidebar";


export default function ProductShell({ currentPath, currentUser, onNavigate, onSignOut, theme, onToggleTheme, children }) {
  return (
    <main className="min-h-screen bg-surface-glow text-ink-900 dark:bg-ink-950 dark:text-white">
      <div className="mx-auto max-w-[96rem] p-4 lg:p-8">
        <div className="overflow-hidden rounded-[2rem] bg-ink-100/60 shadow-shell dark:bg-ink-950/80">
          <div className="grid lg:grid-cols-[16rem_1fr]">
            <Sidebar currentPath={currentPath} currentUser={currentUser} onNavigate={onNavigate} onSignOut={onSignOut} />
            <div className="space-y-6 bg-ink-50/80 p-4 dark:bg-ink-950/60 lg:p-8">
              {children({ theme, onToggleTheme })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
