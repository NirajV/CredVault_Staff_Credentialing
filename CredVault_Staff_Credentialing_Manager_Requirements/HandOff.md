# NexaCred (CredVault) — Session Hand-Off Document

> **Rule:** This file is updated at the end of every session. Read it first thing every next session before touching any code.

---

## Project Identity

| Item | Value |
|---|---|
| **App name** | NexaCred (internal code name: CredVault) |
| **Purpose** | Healthcare provider credentialing & license management |
| **Working directory** | `C:\Users\niraj\Project_Gen_AI\CredVault_Staff_Credentialing_Manager_Requirements\` |
| **Git branch** | `main` |
| **DB file (SQLite dev)** | `backend\credvault.db` (absolute path hardcoded in database.js) |

---

## How to Start the App

### 1 — Backend (Express, port 3220)

```powershell
# From project root
cd backend
npm start
```

If port 3220 is already in use (common after a crash):
```powershell
$conns = Get-NetTCPConnection -LocalPort 3220 -ErrorAction SilentlyContinue
$conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
# Wait 2s, then npm start again
```

Health check: `http://localhost:3220/health`

### 2 — Frontend (Vite + React, port 5173)

```powershell
cd frontend
npm run dev
```

App URL: `http://localhost:5173`

### 3 — Verify both are up

```powershell
Invoke-WebRequest -Uri "http://localhost:3220/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
```

---

## Tech Stack Quick Reference

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3, Lucide icons |
| State | React Context + custom hooks (`useProviders`, `useAuth`) |
| HTTP | `authFetch` wrapper in `frontend/src/services/api.js` — auto-attaches JWT from localStorage |
| Backend | Node.js 18, Express 4, ES modules (`import/export`) |
| ORM | Sequelize 6 |
| Database | SQLite (dev) — file at `backend/credvault.db` |
| Auth | JWT RS256, access token 1h, refresh 7d |
| Email | Nodemailer → Gmail SMTP `smtp.gmail.com:587` STARTTLS |
| Scheduler | `node-schedule` — cron `0 8 * * *` (daily 8 AM alert job) |
| Themes | CSS custom properties (`--surface`, `--primary`, etc.) driven by `ThemeContext.jsx` |

---

## Environment File — `backend/.env`

**NEVER COMMIT THIS FILE** (it is in `.gitignore`).

```
NODE_ENV=development
PORT=3220
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRY=1h
JWT_REFRESH_SECRET=dev-refresh-secret-key-not-for-production
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=credvault

EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USER=demo@biomedmeet.com
SMTP_PASSWORD=iysraffiniwiiuvu
SMTP_FROM=demo@biomedmeet.com
SENDER_NAME=NexaCred Team
APP_URL=http://localhost:5173
```

> **Gmail App Password note:** The password `iysraffiniwiiuvu` is the raw 16-char string (no spaces — spaces are display-only in the Google UI). The account is `demo@biomedmeet.com` (Google Workspace). Gmail daily sending quota is account-level; a new App Password does NOT reset it.

---

## Key File Map

```
backend/
  src/
    app.js                   — Express bootstrap, route wiring, daily cron schedule
    config/database.js       — Sequelize init, model registration, associations
    controllers/
      providerController.js  — CRUD + new getProviderMeta() for dropdown options
    routes/
      auth.js                — login, register (→ welcome email), forgot-password (→ reset email)
      providers.js           — GET /meta (BEFORE /:id), GET /, POST /, GET /:id, PATCH /:id, DELETE /:id
      dashboard.js           — GET /summary — urgentAlerts now includes providerId
      alertSettings.js       — runAlertJob(), /send-alerts, /test/:id, CRUD for AlertRule
    services/
      emailService.js        — Nodemailer: sendWelcomeEmail, sendPasswordResetEmail, sendCredentialAlertEmail
    models/
      User, Provider, License, Certification, DEA, Malpractice, Privilege, Task, AlertRule

frontend/
  src/
    App.jsx                  — AppShell: routing state, navigateToProvider(), passes onNavigateToProvider to Dashboard
    pages/
      Dashboard.jsx          — KPI cards + Urgent Alerts feed (click provider name → opens provider detail)
      AlertsPage.jsx
      ReportsPage.jsx
      AlertSettingsPage.jsx
      LoginPage.jsx
      SettingsPage.jsx
    components/
      Providers/
        ProviderDirectory.jsx  — Search + Specialty dropdown + Status dropdown + provider card list
        CredentialsViewer.jsx  — Tabbed credential view with SVG health rings per credential
        ProviderForm.jsx       — Add provider form
    hooks/
      useProviders.js          — setSearchFilter, setSpecialtyFilter, setStatusFilter, pagination
    services/
      api.js                   — authFetch() helper, API_URL = http://localhost:3220/api/v1
    context/
      AuthContext.jsx
      ThemeContext.jsx          — 4 themes: Verdigris Day (default), Carbon, Ocean, Warm
    App.css                    — ring-pulse keyframe, --surface / --surface-raised theme vars
```

---

## Completed Features (as of last session)

### Core App
- [x] Authentication — login, register, forgot-password with temp password
- [x] JWT token management — access (1h) + refresh (7d) stored in localStorage
- [x] Post-login disclaimer modal (shown once per browser session)
- [x] 4 visual themes — Verdigris Day (card `#CDD6CC`), Carbon, Temper, Verdigris Nocturne
- [x] Sidebar navigation — Dashboard, Providers, Alerts, Reports, Alert Settings, Settings

### Provider Management
- [x] Provider Directory — searchable list with avatar, compliance score, status badge
- [x] Provider CRUD — create, view credentials, soft-delete
- [x] Specialty filter dropdown (dynamic, from `/providers/meta`)
- [x] Status filter dropdown (Active / Inactive / Suspended / Terminated)
- [x] "Clear filters" button appears only when a filter is active
- [x] **Search fixed** — was using `Op.iLike` (PostgreSQL-only); now uses dialect-aware `Op.like` for SQLite, `Op.iLike` for PostgreSQL

### Credential Management
- [x] Tabbed credentials viewer: Licenses, Certifications, DEA, Malpractice, Privileges, Tasks
- [x] Edit / Add / Delete credentials inline
- [x] **Credential Health KPI Rings** — SVG donut rings per credential row, color-coded by days remaining:
  - >180d → green `#10b981`
  - 91–180d → amber `#f59e0b`
  - 46–90d → orange `#f97316`
  - 16–45d → red `#ef4444`
  - 1–15d → dark-red `#dc2626` + **pulsing animation**
  - Expired → near-black `#991b1b`
- [x] **Credential Health Overview Strip** — 5 category summary cards above the tabs, worst-case expiry per type, click to switch active tab

### Dashboard
- [x] 6 KPI summary cards (total providers, expiring, expired, compliance rate, avg score, total credentials)
- [x] Urgent Alerts feed — top 5 most critical credential expirations
- [x] Clicking a provider name in Urgent Alerts navigates directly to that provider's detail page
- [x] Provider Status breakdown bars
- [x] Credential type breakdown grid
- [x] Specialty breakdown (top 6)
- [x] Quick actions

### Email Automation
- [x] **Welcome email** — sent on `POST /auth/register`, includes username + temp-visible password + sign-in CTA
- [x] **Password reset email** — sent on `POST /auth/forgot-password`, includes new temp password + red security warning
- [x] **Credential alert email** — one email per provider per rule, credential cards with colored left-border sorted by urgency
- [x] Daily cron job at 8:00 AM — runs `runAlertJob()` automatically
- [x] Manual trigger — `POST /api/v1/alert-settings/send-alerts`
- [x] Alert rule test — `POST /api/v1/alert-settings/test/:ruleId` with `{"testEmail":"..."}`
- [x] Alert thresholds: 180 / 90 / 45 / 30 / 15 / 7 / 0 days
- [x] **All three templates live-tested** — Welcome, Password Reset, and Credential Alert emails confirmed delivered (2026-06-21)

### Reports / Alerts Pages
- [x] Alerts page with filtering and acknowledgement
- [x] Reports page with compliance summary and export
- [x] Alert Settings page — configure rules, notify emails, enable/disable
- [x] **Alert Settings dark theme fix** — rule cards now use `var(--surface-raised)` / `var(--border-strong)` / `var(--primary-light)` inline styles; threshold badges use `var(--primary-light)` bg + `var(--primary)` text; fully visible across all 3 nocturne themes

### Docker & Infrastructure
- [x] `docker-compose.yml` — fixed port (3001→3220), all env vars wired, MinIO + PostgreSQL + backend + frontend services
- [x] `backend/Dockerfile` + `frontend/Dockerfile` — updated with correct ports, `--host` flag for Vite
- [x] `backend/.dockerignore` + `frontend/.dockerignore` — excludes node_modules, .env, *.db from build context
- [x] `.gitignore` — removed incorrect rule that was blocking `.dockerignore` files
- [x] `DOCKER_POSTGRESQL_SETUP.md` — full step-by-step guide (prerequisites, startup, PostgreSQL GUI options, MinIO bucket, email config, SQLite↔PostgreSQL switching, troubleshooting, architecture diagram)

---

## Outstanding Tasks (start here next session)

### HIGH PRIORITY

#### 1. Provider Edit / Update Form
There is no "Edit Provider" UI — only Add and Delete. Need an edit form (or inline edit) to update specialty, employment type, status, phone, hire date, etc. The backend `PATCH /providers/:id` endpoint already exists.

---

### MEDIUM PRIORITY

#### 2. Department Field in Provider
Currently the "Dept:" label in the Provider Directory card shows `provider.specialty` (they share the same field). Consider whether to:
- Keep as-is (specialty serves as department)
- Add a separate `department` field to the Provider model and ProviderForm

#### 4. Credential Expiry Date Edit — Verify Round-Trip
The edit flow for credentials (especially licenses) was tested in an earlier session. Confirm the save works correctly for all 5 credential types, especially that the `expiryDate` field persists and the KPI ring updates on reload.

#### 5. Document Upload (S3 / MinIO)
Document upload is in the spec but not yet implemented in the UI. MinIO is in the `.env` config. When ready, implement:
- Drag-drop upload via React Dropzone
- Store in MinIO (`credvault` bucket) with AES-256 SSE
- SHA-256 hash stored in DB for integrity verification
- Version tracking (latest-flag)

#### 6. Compliance Score Recalculation
The compliance score formula is defined in CLAUDE.md but the recalculation job is not wired up. Should run nightly alongside the alert job. Formula:
- License: 25pts, Cert: 20pts, DEA: 20pts, Malpractice: 20pts, Privileges: 15pts
- Active = full pts, expiring <30d = half pts, expired = 0

#### 7. Audit Trail / Logs Page
HIPAA requires a 7-year audit log. The `audit_log` table is planned in the schema but the model and routes are not created yet.

---

### LOW PRIORITY / FUTURE

- [ ] CSV / Excel export for compliance reports
- [ ] Bulk provider import (CSV)
- [ ] Role-based access control enforcement (currently all authenticated users have full access)
- [ ] PostgreSQL migration for production (DATABASE_URL in .env switches automatically)
- [ ] Docker Compose setup for full local stack
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] PWA / mobile responsiveness audit

---

## Known Gotchas & Decisions Made

| Issue | Resolution |
|---|---|
| Backend uses port **3220** not 3001 | `PORT=3220` in `.env` — default 3001 only kicks in if `.env` not loaded |
| SQLite path is **hardcoded** | `database.js` line 15: absolute path `C:\Users\niraj\...` — must update if project moves |
| `backend/.env` is gitignored | Contains SMTP password — never `git add .env`. Add the vars listed above manually if env is lost |
| Gmail App Password spacing | Google shows `xxxx xxxx xxxx xxxx` but store without spaces: `iysraffiniwiiuvu` |
| Gmail quota is **account-level** | Changing the App Password doesn't reset the daily quota. Wait for overnight reset (midnight Pacific) |
| `node-schedule` cron uses **server local time** | The `0 8 * * *` expression fires at 8 AM in whatever timezone the server is running |
| `/providers/meta` route order | Must be declared **before** `/:id` in `providers.js` or Express catches "meta" as a provider ID |
| `$pid` is read-only in PowerShell | Use `$p` or `$procId` as the loop variable when iterating PIDs — `$pid` is reserved |
| Verdigris Day surface color | Was tested with `#84d4e2`, `#ccbaa4`, `#1A3A33` in earlier sessions — reverted to `#FBFCF8` (cream) |
| Git commit denied for `.env` | Correct — never commit `.env`. Only stage specific code files |
| Provider search used `Op.iLike` | PostgreSQL-only operator — crashed on SQLite. Fixed to use `sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like` in `providerController.js` |
| Verdigris Day card surface | Final settled color: `--surface: #CDD6CC`, `--surface-raised: #BEC9BC` (updated in both `ThemeContext.jsx` and `App.css :root`) |
| Alert Settings dark theme | `bg-gray-50/50` opacity modifier bypasses CSS overrides; `bg-gray-200` maps to near-transparent border in dark themes. Fix: use `style={{ background: 'var(--surface-raised)' }}` directly and `var(--primary-light)` for badges |
| Docker bring-up guide | See `DOCKER_POSTGRESQL_SETUP.md` — full step-by-step. Run `docker compose up --build` from project root |

---

## API Endpoints Quick Reference

### Auth (public)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/auth/login` | Login → returns access + refresh token |
| POST | `/api/v1/auth/register` | Create user → sends welcome email |
| POST | `/api/v1/auth/forgot-password` | Reset password → sends reset email |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Get current user (requires JWT) |

### Providers (requires JWT)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/providers/meta` | Unique specialties + statuses for dropdowns |
| GET | `/api/v1/providers` | List with `?search=&specialty=&status=&page=&limit=` |
| POST | `/api/v1/providers` | Create provider |
| GET | `/api/v1/providers/:id` | Single provider |
| PATCH | `/api/v1/providers/:id` | Update provider |
| DELETE | `/api/v1/providers/:id` | Soft-delete |

### Credentials (requires JWT)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/credentials/:providerId` | All credentials for a provider |
| POST | `/api/v1/credentials/license` | Add license |
| PATCH | `/api/v1/credentials/license/:id` | Edit license |
| DELETE | `/api/v1/credentials/license/:id` | Delete license |
| (same pattern for certification, dea, malpractice, privilege, task) | | |

### Dashboard & Alerts
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/dashboard/summary` | KPI data + urgentAlerts (now includes providerId) |
| GET | `/api/v1/alerts` | Alert list with filters |
| PATCH | `/api/v1/alerts/:id/acknowledge` | Acknowledge an alert |
| GET | `/api/v1/alert-settings` | List alert rules |
| POST | `/api/v1/alert-settings` | Create rule |
| PATCH | `/api/v1/alert-settings/:id` | Update rule |
| DELETE | `/api/v1/alert-settings/:id` | Delete rule |
| POST | `/api/v1/alert-settings/send-alerts` | Manually trigger alert job |
| POST | `/api/v1/alert-settings/test/:id` | Send test email for a rule |

---

## Git Status at End of This Session

**All changes committed. Working tree clean.**

**Recent commit history (HEAD → oldest):**
```
(this session)  Fix Alert Settings dark theme visibility across all nocturne themes
4c10f8b         Add Docker + PostgreSQL local setup with step-by-step guide
19ed40d         Fix provider search, set Verdigris Day card color #CDD6CC, confirm email delivery
77cdd51         Add dashboard alert click-through, provider directory filters, and HandOff doc
415dce4         Revert Verdigris Day card surface to original cream white
```

**Files changed in last commit (this session):**
```
M  frontend/src/pages/AlertSettingsPage.jsx  — rule cards, badges, panels all use CSS vars; 
                                               visible in Verdigris/Temper/Carbon nocturne themes
M  HandOff.md                               — updated completed features, gotchas, git status
```

---

## How Claude Should Use This File

At the start of each session:
1. Read this file completely before any other action
2. Confirm both servers are running (health check commands above)
3. Note the "Outstanding Tasks" section — ask the user which one to tackle, or proceed with item #1 if emails haven't been tested yet
4. After the session ends, update this file: add completed tasks to "Completed Features", move new items to "Outstanding Tasks", update "Git Status at End of This Session"
