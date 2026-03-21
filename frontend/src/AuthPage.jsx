import { useState } from "react";


function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export default function AuthPage({ mode, onSubmit, onNavigate }) {
  const isSignUp = mode === "signup";
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (isSignUp && formValues.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!validateEmail(formValues.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formValues.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isSignUp && formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formValues);
      setSuccess(isSignUp ? "Account created. Redirecting to your dashboard..." : "Signed in. Redirecting...");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-100 px-4 py-10 dark:bg-ink-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-xl rounded-[2rem] border border-ink-200/70 bg-white/90 p-8 shadow-shell dark:border-white/10 dark:bg-ink-900/80">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">Cecurus</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink-900 dark:text-white">
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-300">
            {isSignUp
              ? "Create a lightweight MVP account to access the claims review dashboard."
              : "Use your account to continue into the claims review workspace."}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {isSignUp ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Full Name</span>
              <input
                type="text"
                value={formValues.name}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>
          ) : null}
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Email</span>
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Password</span>
            <input
              type="password"
              value={formValues.password}
              onChange={(event) => setFormValues((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          {isSignUp ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Confirm Password</span>
              <input
                type="password"
                value={formValues.confirmPassword}
                onChange={(event) => setFormValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-ink-900 outline-none transition focus:border-brand-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </label>
          ) : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {success ? <p className="text-sm text-brand-600 dark:text-brand-300">{success}</p> : null}
          <button
            type="submit"
            className="inline-flex rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? (isSignUp ? "Creating account..." : "Signing in...") : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-sm text-ink-500 dark:text-ink-300">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            type="button"
            className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-300"
            onClick={() => onNavigate(isSignUp ? "/signin" : "/signup")}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </section>
    </main>
  );
}
