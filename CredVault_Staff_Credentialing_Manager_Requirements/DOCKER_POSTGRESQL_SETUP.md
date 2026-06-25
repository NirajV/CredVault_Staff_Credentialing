# NexaCred — Docker + PostgreSQL Local Setup Guide

Complete step-by-step instructions to run the full NexaCred stack locally using Docker Compose with PostgreSQL (instead of the default SQLite dev database).

---

## What Docker Compose Starts

| Container | Image | Port | Purpose |
|---|---|---|---|
| `credvault-postgres` | postgres:15-alpine | `5432` | PostgreSQL database |
| `credvault-minio` | minio/minio:latest | `9000` / `9001` | S3-compatible document storage |
| `credvault-backend` | Node 18 (local build) | `3220` | Express API server |
| `credvault-frontend` | Node 18 (local build) | `5173` | Vite + React dev server |

---

## Prerequisites

Install all of these before starting.

### 1. Docker Desktop
- Download: https://www.docker.com/products/docker-desktop/
- Windows: enable **WSL 2** backend during install (recommended)
- After install, verify:
```powershell
docker --version
docker compose version
```
Expected output example:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

### 2. Git (to clone the repo)
```powershell
git --version
```

### 3. Node.js 18+ (only needed to run locally without Docker)
Not required for the Docker path. Skip if you are running everything in containers.

---

## Step 1 — Clone the Repository

```powershell
git clone <your-repo-url>
cd CredVault_Staff_Credentialing_Manager_Requirements
```

---

## Step 2 — Create the Backend Environment File

The `.env` file is **never committed** to git. You must create it manually.

```powershell
copy backend\.env.example backend\.env
```

Then open `backend\.env` and set the values below. **These exact values match the Docker Compose configuration** — do not change the database credentials unless you also change them in `docker-compose.yml`.

```env
NODE_ENV=development
PORT=3220

# ── PostgreSQL (matches docker-compose.yml) ───────────────────────────────────
DATABASE_URL=postgresql://credvault_user:credvault_pass@localhost:5432/credvault_db

# ── JWT ───────────────────────────────────────────────────────────────────────
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRY=1h
JWT_REFRESH_SECRET=dev-refresh-secret-key-not-for-production
JWT_REFRESH_EXPIRY=7d

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_LEVEL=debug

# ── MinIO (S3 local storage) ──────────────────────────────────────────────────
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=credvault

# ── Email (optional — set EMAIL_ENABLED=true to activate) ────────────────────
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SENDER_NAME=NexaCred Team
APP_URL=http://localhost:5173
```

> **Note:** When running via Docker Compose, the backend container gets its environment injected directly from `docker-compose.yml` — it does NOT read the `.env` file. The `.env` file is only used when running the backend locally with `npm start`.

---

## Step 3 — Start All Services

From the project root (where `docker-compose.yml` lives):

```powershell
docker compose up --build
```

- `--build` rebuilds the backend and frontend images (always use on first run or after code changes to `package.json`)
- Subsequent starts without code changes: `docker compose up`
- Run in background (detached): `docker compose up -d`

Docker will pull the PostgreSQL and MinIO images automatically (~200 MB total, one-time download).

**Expected startup sequence:**
```
credvault-postgres  | database system is ready to accept connections
credvault-minio     | MinIO Object Storage Server
credvault-backend   | ✅ Database connected successfully
credvault-backend   | ✅ Database tables synced
credvault-backend   | ✨ CredVault Backend Server running on http://localhost:3220
credvault-frontend  | VITE v5.x.x  ready in xxx ms
credvault-frontend  | ➜  Local: http://localhost:5173/
```

---

## Step 4 — Verify Everything Is Running

Open a new PowerShell window and run:

```powershell
# Check all containers are Up
docker compose ps

# Backend health check
Invoke-WebRequest -Uri "http://localhost:3220/health" -UseBasicParsing

# Frontend
Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
```

Expected `docker compose ps` output:
```
NAME                   STATUS          PORTS
credvault-postgres     Up (healthy)    0.0.0.0:5432->5432/tcp
credvault-minio        Up (healthy)    0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
credvault-backend      Up              0.0.0.0:3220->3220/tcp
credvault-frontend     Up              0.0.0.0:5173->5173/tcp
```

---

## Step 5 — Connect to PostgreSQL

### Option A — psql inside the container (no extra tools needed)

```powershell
docker exec -it credvault-postgres psql -U credvault_user -d credvault_db
```

Useful psql commands:
```sql
\dt              -- list all tables
\d providers     -- describe the providers table
SELECT COUNT(*) FROM providers;
\q               -- quit
```

### Option B — pgAdmin 4 (GUI)

1. Download pgAdmin 4: https://www.pgadmin.org/download/
2. Open pgAdmin → right-click **Servers** → **Register → Server**
3. Fill in:
   - **Name:** NexaCred Local
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `credvault_db`
   - **Username:** `credvault_user`
   - **Password:** `credvault_pass`
4. Click **Save** — you'll see all tables under `credvault_db → Schemas → public → Tables`

### Option C — DBeaver (free universal DB GUI)

1. Download: https://dbeaver.io/download/
2. New Connection → PostgreSQL
3. Host: `localhost`, Port: `5432`, Database: `credvault_db`
4. User: `credvault_user`, Password: `credvault_pass`
5. Test Connection → Finish

---

## Step 6 — Set Up MinIO Bucket

The `credvault` bucket must exist before document uploads work.

1. Open MinIO Console: http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Click **Buckets** → **Create Bucket**
4. Name: `credvault`
5. Click **Create Bucket**

Or create it from the command line:

```powershell
# Install MinIO client (mc) if not present
# https://min.io/docs/minio/linux/reference/minio-mc.html

mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/credvault
mc ls local
```

---

## Step 7 — Open the App

| URL | Purpose |
|---|---|
| http://localhost:5173 | NexaCred web app |
| http://localhost:3220/health | Backend health check |
| http://localhost:3220/api/v1 | API base URL |
| http://localhost:9001 | MinIO console (minioadmin / minioadmin) |
| localhost:5432 | PostgreSQL (use pgAdmin/DBeaver) |

---

## Step 8 — Enable Email (Optional)

To activate email sending inside Docker:

1. Open `docker-compose.yml`
2. Under the `backend` service `environment:` section, update:
```yaml
EMAIL_ENABLED:  "true"
SMTP_USER:      "your-email@gmail.com"
SMTP_PASSWORD:  "your-16-char-app-password"
SMTP_FROM:      "your-email@gmail.com"
```
3. Restart the backend container:
```powershell
docker compose restart backend
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail". Store without spaces.

---

## Common Docker Commands

```powershell
# Start all services
docker compose up -d

# Stop all services (keeps data volumes)
docker compose down

# Stop AND delete all data (fresh start)
docker compose down -v

# Rebuild images after changing Dockerfile or package.json
docker compose up --build

# Restart a single service
docker compose restart backend
docker compose restart frontend

# View live logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f postgres

# Open a shell inside a container
docker exec -it credvault-backend sh
docker exec -it credvault-frontend sh
docker exec -it credvault-postgres bash

# Check resource usage
docker stats
```

---

## Switching Between SQLite (local dev) and PostgreSQL (Docker)

The backend automatically picks the right database based on environment:

| Run mode | How | Database used |
|---|---|---|
| `npm start` in `/backend` | Reads `backend/.env` | **SQLite** if `DATABASE_URL` is commented out |
| `docker compose up` | Reads `docker-compose.yml` environment | **PostgreSQL** always |

To use PostgreSQL locally without Docker, uncomment `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://credvault_user:credvault_pass@localhost:5432/credvault_db
```
Then start PostgreSQL separately (or just use Docker for the database only):
```powershell
docker compose up postgres -d
npm start   # backend now connects to the Dockerized PostgreSQL
```

---

## Troubleshooting

### Port already in use
```powershell
# Find what's using port 3220
Get-NetTCPConnection -LocalPort 3220 | Select-Object OwningProcess
# Kill it
Stop-Process -Id <PID> -Force
```

### Backend crashes on startup with "DATABASE_URL not set"
The backend is falling back to SQLite and the absolute path in `database.js` doesn't exist inside the container. Ensure `DATABASE_URL` is set in `docker-compose.yml` under the `backend` environment — it should be there already.

### PostgreSQL container won't start
Check if port 5432 is already used by a local PostgreSQL install:
```powershell
Get-NetTCPConnection -LocalPort 5432
```
Stop the local PostgreSQL service in Windows Services, or change the port mapping in `docker-compose.yml` to `"5433:5432"` and update `DATABASE_URL` accordingly.

### Containers start but frontend shows blank page
```powershell
docker compose logs frontend
```
Look for Vite build errors. Usually means a missing `node_modules` — rebuild:
```powershell
docker compose up --build frontend
```

### Changes to source code not reflecting
The `volumes:` mounts in `docker-compose.yml` sync `./backend/src` and `./frontend/src` into the containers. The backend uses `node --watch` and Vite has HMR — changes should appear within 1–2 seconds. If they don't:
```powershell
docker compose restart backend
docker compose restart frontend
```

### Reset everything and start fresh
```powershell
docker compose down -v          # removes containers + named volumes (deletes DB data)
docker compose up --build       # rebuilds images + starts fresh
```

---

## Production Differences

When deploying to production (AWS ECS, DigitalOcean, etc.):

1. Set `NODE_ENV=production` in backend environment
2. Use AWS Secrets Manager or environment variables for all secrets — never hardcode
3. Replace MinIO with real AWS S3 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`)
4. Use managed PostgreSQL (AWS RDS, DigitalOcean Managed DB) — same `DATABASE_URL` format
5. Build the frontend for production: `npm run build` → serve `dist/` via Nginx
6. Enable SSL/TLS with Let's Encrypt via the Nginx reverse proxy
7. Set `JWT_SECRET` and `JWT_REFRESH_SECRET` to cryptographically random 64-char strings

---

## Architecture Diagram

```
Browser (host machine)
    │
    ├──► http://localhost:5173  ──► [credvault-frontend container]
    │                                  Vite dev server
    │
    └──► http://localhost:3220  ──► [credvault-backend container]
                                       Express API
                                           │
                              ┌────────────┼────────────────┐
                              ▼            ▼                ▼
                    [postgres:5432]  [minio:9000]    node-schedule
                    credvault_db     credvault        daily 8 AM alerts
                    (named volume)   (named volume)
```

All containers communicate via the `credvault-network` Docker bridge network using their service names as hostnames (e.g., backend reaches postgres at `postgres:5432`).

---

*Last updated: 2026-06-25*
