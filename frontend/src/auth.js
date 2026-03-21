const ACCOUNTS_STORAGE_KEY = "cecurus_mvp_accounts";
const SESSION_STORAGE_KEY = "cecurus_mvp_session";

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function delay(ms = 300) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function getStoredAccounts() {
  return readJson(ACCOUNTS_STORAGE_KEY, []);
}

export function getCurrentUser() {
  return readJson(SESSION_STORAGE_KEY, null);
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export async function signUp({ name, email, password }) {
  await delay();
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with that email already exists.");
  }

  const nextUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
  };

  writeJson(ACCOUNTS_STORAGE_KEY, [...accounts, nextUser]);
  writeJson(SESSION_STORAGE_KEY, {
    id: nextUser.id,
    name: nextUser.name,
    email: nextUser.email,
  });

  return getCurrentUser();
}

export async function signIn({ email, password }) {
  await delay();
  const normalizedEmail = email.trim().toLowerCase();
  const account = getStoredAccounts().find(
    (candidate) => candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!account) {
    throw new Error("Invalid email or password.");
  }

  const sessionUser = {
    id: account.id,
    name: account.name,
    email: account.email,
  };
  writeJson(SESSION_STORAGE_KEY, sessionUser);
  return sessionUser;
}

export function signOut() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
