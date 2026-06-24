# Project Cecurus

> A web platform for detecting and reviewing duplicate medical claims.

---

## Overview

**Project Cecurus** helps hospitals and healthcare organizations catch **duplicate medical claims** before they result in overpayments or compliance issues.

The platform accepts industry-standard EDI claim files, applies automated duplicate detection, and surfaces flagged claims in a structured review dashboard — without ever storing raw claim data or Protected Health Information (PHI).

---

## Key Features

- **Duplicate Detection** — Automatically identifies duplicate and near-duplicate claims across uploaded files.
- **Zero-Storage Architecture** — Raw claim payloads and PHI are never written to disk. Only anonymized aggregate metrics are retained.
- **Multi-Tenant & Role-Based Access** — Supports multiple organizations with per-role permissions.
- **Review Dashboard** — Reviewers can triage flagged claims, update statuses, and track resolution.
- **Secure Authentication** — Token-based auth with password reset and an email invite system.
- **Audit Trail** — User actions are logged in a non-identifiable audit record.
- **HIPAA-Aware** — Built with configurable session management and compliance controls.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python |
| **Auth** | JWT, bcrypt |

---

## Getting Started

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

### 4. Configure Environment Variables

Required environment variables must be set before running either service. Refer to your team's internal configuration documentation for the full list.

> **Important:** Never use placeholder or default values for secrets outside of local development.

---

## Running Locally

Start both services in separate terminals:

**Backend:**
```bash
python -m uvicorn backend.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## User Roles

| Role | Description |
|---|---|
| **Admin** | Full access — manages users, settings, and audit logs |
| **Reviewer** | Reviews and resolves flagged claims |
| **Analyst** | Uploads files, runs detection, views dashboard |
| **Hospital Staff** | Limited read access |

---

## Security & Compliance

- PHI and raw claim data are processed in-memory only and never persisted.
- Role-based access control is enforced throughout.
- All user actions are recorded in a non-identifiable audit log.

---

## License

Private project. All rights reserved.

---

Project Cecurus v1.0.0
