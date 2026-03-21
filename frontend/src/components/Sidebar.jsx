import BrandLogo from "./BrandLogo";


function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
      <path d="M6 21V5" />
      <path d="M6 6c2-1 3-1 5 0s3 1 5 0 3-1 5 0v9c-2-1-3-1-5 0s-3 1-5 0-3-1-5 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: <HomeIcon /> },
  { path: "/dashboard", label: "Dashboard", icon: <GridIcon /> },
  { path: "/analytics", label: "Claim Flags", icon: <FlagIcon /> },
  { path: "/analytics", label: "Analytics", icon: <SettingsIcon /> },
];

export default function Sidebar({ currentPath, currentUser, onNavigate, onSignOut }) {
  return (
    <aside className="flex min-h-screen flex-col rounded-r-[2rem] bg-sidebar-gradient px-5 py-7 text-white lg:rounded-[2rem]">
      <div className="border-b border-white/10 pb-6">
        <BrandLogo withWordmark dark compact />
      </div>

      <nav className="mt-6 space-y-2">
        {NAV_ITEMS.map((item, index) => {
          const active = currentPath === item.path && (index !== 2 || currentPath === "/analytics");
          return (
            <button
              key={`${item.label}-${index}`}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                active ? "bg-brand-500/20 text-white shadow-glow" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-white/12" : "bg-white/6"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3 rounded-3xl bg-white/8 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-sm font-semibold">
            {(currentUser?.name ?? "R").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentUser?.name ?? "Reviewer"}</p>
            <p className="truncate text-xs text-white/60">{currentUser?.email ?? ""}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
