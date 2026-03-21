import { useEffect, useState } from "react";

import AnalyticsPage from "./AnalyticsPage";
import AuthPage from "./AuthPage";
import DashboardPage from "./DashboardPage";
import LandingPage from "./LandingPage";
import ProductShell from "./ProductShell";
import { getCurrentUser, isAuthenticated, signIn, signOut, signUp } from "./auth";


function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}

function getStoredTheme() {
  return window.localStorage.getItem("cecurus_theme") ?? "light";
}

function Header({ currentPath, currentUser, onNavigate }) {
  const isSignedIn = Boolean(currentUser);

  return (
    <header className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <button
        type="button"
        className="text-xl font-semibold tracking-[0.2em] text-brand-700 dark:text-brand-300"
        onClick={() => onNavigate(isSignedIn ? "/dashboard" : "/")}
      >
        CECURUS
      </button>
      <nav className="flex items-center gap-3">
        {isSignedIn ? (
          <button
            type="button"
            className={currentPath === "/dashboard" ? "rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200" : "rounded-full px-4 py-2 text-sm font-medium text-ink-500 dark:text-ink-300"}
            onClick={() => onNavigate("/dashboard")}
          >
            Dashboard
          </button>
        ) : (
          <>
            <button
              type="button"
              className={currentPath === "/signin" ? "rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200" : "rounded-full px-4 py-2 text-sm font-medium text-ink-500 dark:text-ink-300"}
              onClick={() => onNavigate("/signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400"
              onClick={() => onNavigate("/signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || "/");
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("cecurus_theme", theme);
  }, [theme]);

  useEffect(() => {
    function handleNavigation() {
      setCurrentPath(window.location.pathname || "/");
      setCurrentUser(getCurrentUser());
    }

    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  useEffect(() => {
    if (["/dashboard", "/analytics"].includes(currentPath) && !isAuthenticated()) {
      navigateTo("/signin");
      return;
    }

    if (!["/", "/signin", "/signup", "/dashboard", "/analytics"].includes(currentPath)) {
      navigateTo(isAuthenticated() ? "/dashboard" : "/");
    }
  }, [currentPath]);

  async function handleSignIn(formValues) {
    const user = await signIn(formValues);
    setCurrentUser(user);
    navigateTo("/dashboard");
  }

  async function handleSignUp(formValues) {
    const user = await signUp(formValues);
    setCurrentUser(user);
    navigateTo("/dashboard");
  }

  function handleSignOut() {
    signOut();
    setCurrentUser(null);
    navigateTo("/");
  }

  function renderProtectedRoute() {
    if (!currentUser) {
      return null;
    }

    return (
      <ProductShell
        currentPath={currentPath}
        currentUser={currentUser}
        onNavigate={navigateTo}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      >
        {({ theme: shellTheme, onToggleTheme }) =>
          currentPath === "/analytics" ? (
            <AnalyticsPage currentUser={currentUser} theme={shellTheme} onToggleTheme={onToggleTheme} />
          ) : (
            <DashboardPage currentUser={currentUser} theme={shellTheme} onToggleTheme={onToggleTheme} />
          )}
      </ProductShell>
    );
  }

  function renderRoute() {
    if (currentPath === "/signin") {
      return <AuthPage mode="signin" onSubmit={handleSignIn} onNavigate={navigateTo} />;
    }

    if (currentPath === "/signup") {
      return <AuthPage mode="signup" onSubmit={handleSignUp} onNavigate={navigateTo} />;
    }

    if (currentPath === "/dashboard" || currentPath === "/analytics") {
      return renderProtectedRoute();
    }

    return <LandingPage onNavigate={navigateTo} />;
  }

  const isProtectedRoute = currentPath === "/dashboard" || currentPath === "/analytics";

  return (
    <>
      {!isProtectedRoute ? (
        <Header currentPath={currentPath} currentUser={currentUser} onNavigate={navigateTo} />
      ) : null}
      {renderRoute()}
    </>
  );
}
