# 🏥 Project Cecurus

> **Zero-Storage Medical Claims Duplicate Detection Platform**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)

---

## 📋 Overview

**Project Cecurus** is a healthcare-focused web application designed to help hospitals and healthcare organizations detect and review **duplicate medical claims** — before they result in costly overpayments or compliance issues.

The platform parses industry-standard **ANSI X12 837 (EDI)** claim files, runs multi-rule duplicate detection logic, and presents flagged claims in a structured review dashboard — all without ever storing raw claim data or Protected Health Information (PHI) on the server.

### Key Highlights

- 🔍 **Intelligent Duplicate Detection** — Three distinct detection rules catch exact duplicates, repeated service lines within a claim, and same-content claims with different IDs.
- 🛡️ **Zero-Storage Architecture** — Raw claim payloads and PHI are never persisted. Only anonymized aggregate metrics are stored.
- 🏢 **Multi-Tenant & Role-Based** — Supports multiple healthcare organizations, each with their own users and settings, across four roles: Admin, Reviewer, Analyst, and Hospital Staff.
- 📊 **Review Dashboard** — Analysts and reviewers can triage flagged claims, update statuses, and track resolution progress.
- 🔐 **Secure Auth** — JWT-based authentication with access/refresh tokens, password reset flows, email invite system, and HIPAA-compliant session management.
- 📝 **Full Audit Trail** — Every significant action is logged in a non-identifiable audit log.

---

## 🗂️ Project Structure

```
project-cecurus/
├── backend/                  # FastAPI Python API
│   ├── api/                  # Route handlers
│   │   ├── auth_routes.py    # Authentication & user management
│   │   ├── organization_routes.py  # Organization & settings management
│   │   └── processing_routes.py    # File upload, parsing & detection
│   ├── parsers/
│   │   └── x12_837_parser.py # ANSI X12 837 EDI file parser
│   ├── services/
│   │   ├── detection_service.py    # Duplicate detection engine
│   │   ├── file_processing_service.py
│   │   ├── review_service.py       # Review session management
│   │   ├── review_session_store.py # In-memory session store
│   │   ├── audit_service.py
│   │   └── claim_service.py
│   ├── schemas/              # Pydantic request/response schemas
│   ├── models.py             # SQLAlchemy ORM models
│   ├── database.py           # DB engine & session setup
│   ├── security.py           # JWT, password hashing utilities
│   ├── config.py             # Environment-based settings
│   ├── dependencies.py       # FastAPI dependency injection
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Next.js 15 + TypeScript frontend
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # Reusable React components
│   ├── lib/                  # Shared utilities & API client
│   ├── src/                  # Additional source files
│   └── package.json
│
├── INTEGRATION_NOTES.md      # API integration reference
├── AUTH_FLOW_NOTES.md        # Auth architecture notes
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | FastAPI, Python 3.10+, Uvicorn |
| **Database** | SQLite (dev) / configurable via env var |
| **ORM** | SQLAlchemy 2.x |
| **Auth** | JWT (PyJWT), bcrypt (passlib) |
| **Validation** | Pydantic v2 |
| **Testing** | Pytest (backend), Vitest + Testing Library + Playwright (frontend) |

---

## 🔍 Duplicate Detection Rules

The detection engine runs three independent rules on every uploaded file:

| Rule | Flag Prefix | Description |
|---|---|---|
| **Exact Claim Duplicate** | `EXACT-*` | Claims share the same `claim_id`, provider identities, and identical service lines |
| **Duplicate Service Lines Within Claim** | `LINE-*` | A single claim contains repeated service line entries |
| **Same Content, Different IDs** | `CONTENT-*` | Claims have matching providers and service line content but different `claim_id` values |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd project-cecurus
```

### 2. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Running Locally

Open **two terminals** and run both services simultaneously:

**Terminal 1 — Backend:**
```bash
# From the repo root
python -m uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.  
Interactive API docs: `http://localhost:8000/docs`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
The app will be available at `http://localhost:3000` (or Next.js default port).

---

## 🌍 Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `CECURUS_DATABASE_URL` | `sqlite:///...cecurus_dev.db` | Database connection string |
| `CECURUS_JWT_SECRET` | `change-me-for-production` | **Must be changed in production!** |
| `CECURUS_JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `CECURUS_ACCESS_TOKEN_MINUTES` | `15` | Access token lifetime |
| `CECURUS_REFRESH_TOKEN_MINUTES` | `480` | Refresh token lifetime (8 hours) |
| `CECURUS_SESSION_IDLE_MINUTES` | `30` | Session idle timeout |
| `CECURUS_MAX_UPLOAD_BYTES` | `5242880` | Max file upload size (5 MB) |
| `CECURUS_FRONTEND_ORIGINS` | `localhost:3000, 5173, etc.` | Allowed CORS origins |
| `CECURUS_SECURE_COOKIES` | `false` | Enable Secure flag on cookies (set `true` in production) |

> ⚠️ **Production Note:** Always set a strong `CECURUS_JWT_SECRET` and enable `CECURUS_SECURE_COOKIES=true` before deploying.

### Frontend

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | _(unset — uses proxy)_ | Backend API base URL |

---

## 🧪 Running Tests

**Backend:**
```bash
# From the repo root
pytest backend/tests/
```

**Frontend:**
```bash
cd frontend
npm test
```

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full access — manage users, organization settings, view audit logs |
| **Reviewer** | Review and update flagged claim statuses |
| **Analyst** | Upload files, run detection, view dashboard metrics |
| **Hospital Staff** | Limited access — view assigned items |

---

## 🗃️ Data Models

The following core entities are stored in the database (**no PHI or raw claim data is ever persisted**):

- `Organization` — Healthcare organization record
- `FacilityIdentifier` — NPI/tax IDs associated with an organization
- `OrganizationContact` — Contact persons for an organization
- `OrganizationSettings` — Per-org configuration (MFA, session timeouts, thresholds)
- `User` — Staff accounts linked to an organization
- `UserInvite` — Pending email invitations
- `PasswordResetToken` — Secure time-limited password reset tokens
- `AggregateProcessingRun` — Anonymized summary of each detection run (counts only, no PHI)
- `AuditLog` — Non-identifiable audit trail of user actions

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive Swagger UI |
| `POST` | `/api/auth/login` | Authenticate and receive tokens |
| `POST` | `/api/auth/logout` | Revoke session |
| `POST` | `/api/files/upload` | Upload an 837 EDI file |
| `POST` | `/api/files/parse` | Parse an uploaded file into claims |
| `POST` | `/api/files/detect-duplicates` | Run duplicate detection on claims |
| `GET` | `/api/files/review/dashboard` | Retrieve review metrics and flags |
| `GET` | `/api/files/review/flags/{flag_id}` | Get details for a specific flag |
| `PATCH` | `/api/files/flags/{flag_id}` | Update a flag's review status |

See [`INTEGRATION_NOTES.md`](INTEGRATION_NOTES.md) for full request/response shapes.

---

## 🔒 Security & Compliance

- **Zero PHI storage** — Raw claims and patient data are processed in-memory only and never written to disk.
- **JWT authentication** with short-lived access tokens (15 min) and refresh tokens (8 hours).
- **Role-based access control (RBAC)** at the API level.
- **HIPAA-aware session management** — configurable idle timeouts and mandatory MFA for Admin accounts.
- **Audit logging** — all actions tracked with anonymized, non-reversible metadata.
- **CORS protection** — strict origin allowlist configurable via environment variables.

---

## 📄 License

This is a **private project**. All rights reserved. Unauthorized use, distribution, or modification is prohibited.

---

<div align="center">
  <sub>Built with ❤️ for the healthcare industry &mdash; <strong>Project Cecurus v1.0.0</strong></sub>
</div>
