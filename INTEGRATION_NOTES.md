# Integration Notes

## Backend endpoints used by the frontend

- `GET /health`
  Returns `{ "status": "ok" }`.
- `POST /api/files/upload`
  Multipart form upload with field name `file`.
  Returns `{ filename, content_type, size_bytes }`.
- `POST /api/files/parse`
  Multipart form upload with field name `file`.
  Returns `{ filename, claim_count, claims }`.
- `POST /api/files/detect-duplicates`
  Multipart form upload with field name `file`.
  Returns `{ filename, claim_count, flag_count, flags }`.
- `GET /api/files/review/dashboard`
  Optional query params: `rule_type`, `status`.
  Returns `{ metrics, flags }`.
- `GET /api/files/review/flags/{flag_id}`
  Returns `{ flag, claims }`.
- `PATCH /api/files/flags/{flag_id}`
  JSON body: `{ "status": "New" | "Reviewed" | "Resolved" | "Ignored" }`.
  Returns the updated flag object.

## Expected response shapes

- `metrics`
  - `total_claims_processed: number`
  - `total_flags_created: number`
  - `flags_by_rule_type: Record<string, number>`
  - `flags_by_workflow_status: Record<string, number>`
- `flag`
  - `flag_id: string`
  - `rule_type: string`
  - `claim_ids: string[]`
  - `billing_provider: string`
  - `rendering_provider: string`
  - `matched_identifiers: string[]`
  - `explanation: string`
  - `status: "New" | "Reviewed" | "Resolved" | "Ignored"`
- `claim`
  - `claim_id: string`
  - `billing_provider: object`
  - `rendering_provider: object`
  - `claim_segment: object`
  - `service_lines: object[]`

## Required env vars

- Frontend:
  - `VITE_API_BASE_URL`
    Optional. Leave unset for local Vite proxy usage.
  - `VITE_BACKEND_PROXY_TARGET`
    Optional. Defaults to `http://127.0.0.1:8000`.
- Backend:
  - `CECURUS_FRONTEND_ORIGINS`
    Optional comma-separated allowed origins for CORS.
    Defaults include local Vite ports `5173` and `4173`.

## How to run both apps together locally

1. Start the backend from the repo root:
   `python -m uvicorn backend.main:app --reload`
2. Start the frontend:
   `cd frontend`
   `cmd /c npm run dev`
3. Open the Vite URL shown in the frontend terminal, usually `http://localhost:5173`.
4. Use the file picker in the dashboard to upload an 837 file, then run parse and detection.
