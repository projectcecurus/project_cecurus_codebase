# Auth Flow Notes

## Routes added

- `/`
  Public landing page.
- `/signin`
  Sign-in page.
- `/signup`
  Sign-up page.
- `/dashboard`
  Protected dashboard route.

## Auth assumptions

- There was no existing auth provider or backend auth API in the repo.
- The current implementation uses a lightweight frontend-only MVP auth flow backed by `localStorage`.
- Sign-up creates a local account record and signs the user in immediately.
- Sign-in validates against locally stored accounts.
- Sign-out clears the local session.
- Dashboard access is protected client-side and redirects unauthenticated users to `/signin`.

## Files changed

- `frontend/src/App.jsx`
- `frontend/src/DashboardPage.jsx`
- `frontend/src/LandingPage.jsx`
- `frontend/src/AuthPage.jsx`
- `frontend/src/auth.js`
- `frontend/src/styles.css`
- `frontend/src/App.test.jsx`

## How to test locally

1. Start the backend:
   `python -m uvicorn backend.main:app --reload`
2. Start the frontend:
   `cd frontend`
   `cmd /c npm run dev`
3. Open the frontend URL, usually `http://localhost:5173`
4. Confirm:
   - landing page loads first
   - sign up creates a local session and opens the dashboard
   - sign out returns to landing
   - going directly to `/dashboard` while signed out redirects to sign in
