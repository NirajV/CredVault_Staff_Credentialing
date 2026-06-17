# CREDVAULT: COMPREHENSIVE BUILD PROMPT
## Healthcare Provider Credentialing Management System

---

# TABLE OF CONTENTS
1. Project Overview
2. Architecture & Tech Stack
3. Database Schema (Detailed)
4. Backend API Specifications
5. Frontend Component Architecture
6. Business Logic & Workflows
7. Security & Compliance
8. Error Handling & Validation
9. Testing Strategy
10. Deployment & DevOps
11. Code Structure & Conventions
12. Performance Optimization
13. Monitoring & Logging
14. Third-Party Integrations
15. Sample Data & Seeding

---

# 1. PROJECT OVERVIEW

## Application Name
**CredVault** - Healthcare Provider Credentialing & License Management System

## Purpose
Centralized platform to track, manage, verify, and report on healthcare provider credentials (licenses, certifications, DEA registrations, malpractice insurance) with automated expiration alerts, compliance tracking, and audit-ready reporting.

## Success Criteria
- ✓ Track 1000+ providers without performance degradation
- ✓ Alert users 90/60/30/7 days before expiration
- ✓ Generate compliance reports in <5 seconds
- ✓ Support document uploads up to 50MB
- ✓ Maintain 99.9% uptime
- ✓ Comply with HIPAA security standards
- ✓ Zero credential data loss

## User Personas

### Credentialing Coordinator
- Primary user; spends 6+ hours/day in system
- Manages 200-500 providers
- Needs quick filtering, bulk operations, task assignments
- Priority: Dashboard summary, provider search, task management

### Medical Director
- Reviews/approves credential changes
- Checks compliance status before meetings
- Priority: Compliance dashboard, alert summaries, approval workflows

### HR Administrator
- Handles employment status, onboarding
- Syncs with payroll/benefits systems
- Priority: Provider directory, status updates, bulk exports

### Compliance Officer
- Prepares for audits (JC, CMS, state)
- Generates reports for leadership
- Priority: Audit trail, detailed reports, export functionality

### Hospital Administrator
- Views org-wide compliance status
- Makes staffing/hiring decisions
- Priority: High-level dashboards, summary reports, KPIs

---

# 2. ARCHITECTURE & TECH STACK

## Frontend
- **Framework**: React 18+ with functional components & hooks
- **Build Tool**: Vite (for fast dev/build)
- **CSS**: Tailwind CSS 3+ with custom theme
- **State Management**: React Context + custom hooks (no Redux unless needed)
- **HTTP Client**: Axios with request/response interceptors
- **Form Handling**: React Hook Form + Zod for validation
- **Date Handling**: date-fns or Day.js
- **UI Components**: Headless UI / Radix UI + custom Tailwind
- **Charts/Graphs**: Recharts or Chart.js for compliance visualization
- **File Upload**: React Dropzone
- **Table**: TanStack React Table (headless, flexible)
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.18+
- **Language**: JavaScript (ES6+) or TypeScript (recommended)
- **Database ORM**: Sequelize or TypeORM (with connection pooling)
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or MinIO (local dev)
- **Job Queue**: Node-schedule or Bull Redis (for nightly expiry checks)
- **Validation**: Joi or Zod
- **Logging**: Winston + Pino
- **Error Tracking**: Sentry (optional but recommended)
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## Database
- **Primary DB**: PostgreSQL 14+ (relational for referential integrity)
- **Connection Pool**: pg-pool (30 connections default)
- **Migrations**: Sequelize CLI or TypeORM migrations
- **Backup**: Automated daily backups (WAL-E or pg_dump)
- **Search**: Native PostgreSQL (JSON queries) or Elasticsearch for full-text later

## DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose (dev/prod)
- **Orchestration**: Docker Compose (dev), Kubernetes (prod) OR AWS ECS
- **CI/CD**: GitHub Actions or GitLab CI
- **Hosting**: AWS (EC2 + RDS + S3) OR DigitalOcean OR self-hosted
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt with auto-renewal
- **Environment Management**: dotenv (.env files)
- **Secrets Management**: AWS Secrets Manager or HashiCorp Vault

## Development Tools
- **Version Control**: Git (GitHub/GitLab)
- **Package Manager**: npm or yarn
- **IDE**: VS Code (with recommended extensions list)
- **API Testing**: Postman or Insomnia

---

# 3. DATABASE SCHEMA (DETAILED)

## Core Tables

### 3.1 users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'coordinator', 'director', 'hr', 'auditor') NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### 3.2 providers
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  npi VARCHAR(10) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100),
  sub_specialty VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  ssn_encrypted VARCHAR(255) UNIQUE, -- encrypted
  employment_type ENUM('full_time', 'part_time', 'contractor', 'locum') DEFAULT 'full_time',
  status ENUM('active', 'inactive', 'suspended', 'terminated') DEFAULT 'active',
  status_date TIMESTAMP,
  facility_id UUID REFERENCES facilities(id),
  hire_date DATE,
  termination_date DATE,
  compliance_score INT DEFAULT 0, -- 0-100, calculated field
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_providers_npi ON providers(npi);
CREATE INDEX idx_providers_name ON providers(last_name, first_name);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_specialty ON providers(specialty);
CREATE INDEX idx_providers_facility ON providers(facility_id);
```

### 3.3 licenses
```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  state VARCHAR(2) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  license_type VARCHAR(50), -- MD, DO, NP, PA, etc.
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status ENUM('active', 'expired', 'suspended', 'revoked', 'pending_renewal') DEFAULT 'active',
  psv_status ENUM('pending', 'verified', 'failed', 'manual_required') DEFAULT 'pending',
  psv_date TIMESTAMP,
  psv_method VARCHAR(50), -- 'automated', 'manual', 'document'
  sanctions_flag BOOLEAN DEFAULT FALSE,
  document_url VARCHAR(500),
  document_id UUID, -- reference to documents table
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE(provider_id, state, license_number)
);

CREATE INDEX idx_licenses_provider ON licenses(provider_id);
CREATE INDEX idx_licenses_expiry ON licenses(expiry_date);
CREATE INDEX idx_licenses_status ON licenses(status);
```

### 3.4 certifications
```sql
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  cert_name VARCHAR(150) NOT NULL,
  certifying_body VARCHAR(150) NOT NULL,
  certificate_number VARCHAR(100),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status ENUM('active', 'expired', 'revoked', 'pending_renewal') DEFAULT 'active',
  psv_status ENUM('pending', 'verified', 'failed', 'manual_required') DEFAULT 'pending',
  psv_date TIMESTAMP,
  document_url VARCHAR(500),
  document_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_certifications_provider ON certifications(provider_id);
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date);
```

### 3.5 dea_registrations
```sql
CREATE TABLE dea_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  dea_number VARCHAR(20) UNIQUE NOT NULL,
  state VARCHAR(2),
  issue_date DATE,
  expiry_date DATE NOT NULL,
  status ENUM('active', 'expired', 'revoked', 'suspended') DEFAULT 'active',
  schedules_authorized VARCHAR(50), -- '1,2,3,4,5' - controlled substances
  psv_status ENUM('pending', 'verified', 'failed', 'manual_required') DEFAULT 'pending',
  psv_date TIMESTAMP,
  document_url VARCHAR(500),
  document_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_dea_provider ON dea_registrations(provider_id);
CREATE INDEX idx_dea_number ON dea_registrations(dea_number);
CREATE INDEX idx_dea_expiry ON dea_registrations(expiry_date);
```

### 3.6 malpractice_insurance
```sql
CREATE TABLE malpractice_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  carrier VARCHAR(150) NOT NULL,
  policy_number VARCHAR(100),
  policy_type ENUM('occurrence', 'claims_made') DEFAULT 'claims_made',
  coverage_per_claim DECIMAL(12, 2),
  aggregate_limit DECIMAL(12, 2),
  retroactive_date DATE,
  effective_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  tail_coverage BOOLEAN DEFAULT FALSE,
  tail_expiry_date DATE,
  status ENUM('active', 'expired', 'lapsed') DEFAULT 'active',
  psv_status ENUM('pending', 'verified', 'failed', 'manual_required') DEFAULT 'pending',
  psv_date TIMESTAMP,
  document_url VARCHAR(500),
  document_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_malpractice_provider ON malpractice_insurance(provider_id);
CREATE INDEX idx_malpractice_expiry ON malpractice_insurance(expiry_date);
```

### 3.7 privileges
```sql
CREATE TABLE privileges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id),
  privilege_type VARCHAR(100), -- 'surgical', 'procedural', 'clinical'
  procedures TEXT, -- JSON array of CPT codes: '["36415", "36410"]'
  granted_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  approval_status ENUM('pending', 'approved', 'denied', 'suspended', 'revoked') DEFAULT 'pending',
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  restrictions TEXT, -- 'requires supervision', 'limited case complexity'
  scope_of_practice TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE(provider_id, facility_id)
);

CREATE INDEX idx_privileges_provider ON privileges(provider_id);
CREATE INDEX idx_privileges_facility ON privileges(facility_id);
CREATE INDEX idx_privileges_expiry ON privileges(expiry_date);
```

### 3.8 documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  document_type ENUM('license', 'certification', 'dea', 'malpractice', 'id_verification', 'other') NOT NULL,
  related_credential_id UUID, -- references license_id, cert_id, etc.
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- S3 key or local path
  file_size INT, -- bytes
  file_hash VARCHAR(64), -- SHA-256 for integrity
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_expiry_date DATE,
  version_number INT DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  metadata JSONB, -- {issuer, credential_id, verification_status}
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_documents_provider ON documents(provider_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
```

### 3.9 alerts
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  credential_type ENUM('license', 'certification', 'dea', 'malpractice', 'privilege') NOT NULL,
  credential_id UUID NOT NULL, -- id of the credential
  alert_type ENUM('expiring_90', 'expiring_60', 'expiring_30', 'expiring_7', 'expired', 'renewal_required') NOT NULL,
  alert_date DATE NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'sent', 'acknowledged', 'resolved') DEFAULT 'pending',
  recipients TEXT, -- JSON array of email addresses
  message TEXT,
  sent_at TIMESTAMP,
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_provider ON alerts(provider_id);
CREATE INDEX idx_alerts_type ON alerts(alert_type);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_date ON alerts(alert_date);
```

### 3.10 tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  task_type ENUM('credential_renewal', 'document_upload', 'verification', 'approval', 'follow_up') NOT NULL,
  related_credential_id UUID,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed_at TIMESTAMP,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_provider ON tasks(provider_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 3.11 facilities
```sql
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  facility_type VARCHAR(100), -- 'hospital', 'asc', 'clinic', etc.
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  npi VARCHAR(10),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facilities_name ON facilities(name);
```

### 3.12 audit_log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT'
  resource_type VARCHAR(100), -- 'provider', 'license', 'document', etc.
  resource_id UUID,
  old_values JSONB, -- previous state
  new_values JSONB, -- new state
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

### 3.13 alert_config
```sql
CREATE TABLE alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID, -- for multi-tenant future
  alert_type ENUM('expiring_90', 'expiring_60', 'expiring_30', 'expiring_7') NOT NULL,
  recipients TEXT, -- JSON array of user_ids or email addresses
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, alert_type)
);
```

---

# 4. BACKEND API SPECIFICATIONS

## API Base URL
```
Development: http://localhost:3001/api/v1
Production: https://api.credvault.com/api/v1
```

## Authentication
- **Method**: JWT (JSON Web Tokens)
- **Header**: `Authorization: Bearer {token}`
- **Token Lifetime**: 1 hour access token, 7 days refresh token
- **Refresh Endpoint**: `POST /auth/refresh`

## Response Format (All Endpoints)
```json
{
  "success": true,
  "data": { /* payload */ },
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123abc"
}
```

## Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Provider not found",
    "details": { /* additional context */ },
    "statusCode": 404
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123abc"
}
```

## Core Endpoints

### Authentication Endpoints

#### POST /auth/register
Register new user (Admin only)
```
Body: {
  email: string (email format)
  password: string (min 12 chars, 1 uppercase, 1 number, 1 symbol)
  first_name: string
  last_name: string
  role: 'admin' | 'coordinator' | 'director' | 'hr' | 'auditor'
  department?: string
  phone?: string
}
Response: { user: {...}, accessToken, refreshToken }
Status: 201 Created
```

#### POST /auth/login
```
Body: { email, password }
Response: { user: {...}, accessToken, refreshToken }
Status: 200 OK
```

#### POST /auth/refresh
```
Body: { refreshToken }
Response: { accessToken, refreshToken }
Status: 200 OK
```

#### POST /auth/logout
```
Body: {}
Response: { success: true }
Status: 200 OK
```

### Provider Endpoints

#### GET /providers
List all providers with pagination, filtering, searching
```
Query Params:
  page: int (default 1)
  limit: int (default 20, max 100)
  search: string (name, npi)
  specialty: string (filter)
  status: 'active' | 'inactive' | 'suspended' | 'terminated'
  facility_id: uuid
  compliance_min: int (0-100, filter by compliance score)
  sort_by: 'name' | 'created_at' | 'compliance_score' (default name)
  sort_order: 'asc' | 'desc'

Response: {
  data: [{
    id, npi, first_name, last_name, specialty, email,
    employment_type, status, compliance_score, hire_date,
    facility_id, credentials_count, expiring_count
  }],
  pagination: { page, limit, total, pages }
}
Status: 200 OK
```

#### POST /providers
Create new provider
```
Body: {
  npi: string (10 chars, unique)
  first_name, last_name, specialty, sub_specialty
  email, phone, date_of_birth, ssn_encrypted
  employment_type, facility_id, hire_date
}
Response: { id, ...provider data }
Status: 201 Created
```

#### GET /providers/:id
Get provider details with all credentials
```
Response: {
  id, npi, name, specialty, email, phone, status, compliance_score,
  licenses: [...],
  certifications: [...],
  dea_registrations: [...],
  malpractice_insurance: [...],
  privileges: [...],
  documents: [...],
  tasks: [...],
  activity_log: [...]
}
Status: 200 OK
```

#### PATCH /providers/:id
Update provider info
```
Body: { first_name, last_name, email, phone, status, notes, ... }
Response: { ...updated provider }
Status: 200 OK
```

#### DELETE /providers/:id
Soft-delete provider (set deleted_at)
```
Status: 204 No Content
```

### License Endpoints

#### GET /providers/:providerId/licenses
List licenses for provider
```
Response: { data: [{ id, state, license_number, expiry_date, status, ... }] }
```

#### POST /providers/:providerId/licenses
Create license
```
Body: {
  state, license_number, license_type, issue_date, expiry_date
}
Response: { id, ...license data }
Status: 201 Created
```

#### PATCH /licenses/:id
Update license
```
Body: { state, license_number, expiry_date, status, psv_status, ... }
Response: { ...updated license }
```

#### DELETE /licenses/:id
Soft-delete license
```
Status: 204 No Content
```

### Certification, DEA, Malpractice Endpoints
(Same CRUD pattern as licenses)
```
GET /providers/:providerId/certifications
POST /providers/:providerId/certifications
PATCH /certifications/:id
DELETE /certifications/:id

GET /providers/:providerId/dea
POST /providers/:providerId/dea
PATCH /dea/:id
DELETE /dea/:id

GET /providers/:providerId/malpractice
POST /providers/:providerId/malpractice
PATCH /malpractice/:id
DELETE /malpractice/:id
```

### Privilege Endpoints

#### GET /providers/:providerId/privileges
```
Response: { data: [{ id, facility_id, privilege_type, expiry_date, approval_status, ... }] }
```

#### POST /providers/:providerId/privileges
```
Body: {
  facility_id, privilege_type, procedures: ['36415', '36410'],
  granted_date, expiry_date, restrictions?
}
Response: { id, ...privilege data }
Status: 201 Created
```

#### PATCH /privileges/:id
Update privilege (approval, suspension, etc.)
```
Body: { approval_status, approved_by, approval_date, restrictions, ... }
Response: { ...updated privilege }
```

### Document Endpoints

#### POST /providers/:providerId/documents
Upload document (multipart/form-data)
```
Body:
  file: File (max 50MB)
  document_type: 'license' | 'certification' | 'dea' | 'malpractice' | 'other'
  related_credential_id?: uuid
  document_expiry_date?: date

Response: { id, file_name, file_path, uploaded_at, file_size, ... }
Status: 201 Created
```

#### GET /providers/:providerId/documents
List documents for provider
```
Response: { data: [{ id, document_type, file_name, uploaded_at, version_number, ... }] }
```

#### DELETE /documents/:id
Delete document (hard delete from S3, soft delete from DB)
```
Status: 204 No Content
```

### Task Endpoints

#### GET /tasks
List tasks (filtered by assigned user or provider)
```
Query Params:
  provider_id?: uuid
  assigned_to?: uuid
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_before?: date
  due_after?: date

Response: {
  data: [{
    id, provider_id, assigned_to, task_type, title, due_date,
    status, priority, completed_at, provider: {...}
  }]
}
```

#### POST /providers/:providerId/tasks
Create task for provider
```
Body: {
  assigned_to, task_type, title, description, due_date, priority
}
Response: { id, ...task data }
Status: 201 Created
```

#### PATCH /tasks/:id
Update task
```
Body: { status, notes, completed_at, due_date, ... }
Response: { ...updated task }
```

### Alert Endpoints

#### GET /alerts
List alerts
```
Query Params:
  provider_id?: uuid
  status?: 'pending' | 'sent' | 'acknowledged' | 'resolved'
  alert_type?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'

Response: {
  data: [{
    id, provider_id, credential_type, alert_type, alert_date,
    priority, status, provider: {...}
  }]
}
```

#### PATCH /alerts/:id
Acknowledge alert
```
Body: { status: 'acknowledged' }
Response: { ...updated alert }
```

#### POST /alerts/test
Test alert configuration (send test email)
```
Body: { alert_type, email }
Response: { success: true, message: "Test alert sent to {email}" }
```

### Alert Configuration Endpoints

#### GET /alert-config
Get alert configuration
```
Response: {
  data: [{
    alert_type, recipients, email_enabled, sms_enabled, in_app_enabled
  }]
}
```

#### PATCH /alert-config/:type
Update alert configuration
```
Body: { recipients, email_enabled, sms_enabled, in_app_enabled }
Response: { ...updated config }
```

### Dashboard Endpoints

#### GET /dashboard/summary
Get dashboard metrics
```
Response: {
  total_providers: int,
  active_providers: int,
  expiring_this_month: int,
  expired: int,
  compliant_percentage: float,
  avg_compliance_score: float,
  critical_alerts: int,
  pending_tasks: int,
  providers_by_status: { active, inactive, suspended, terminated },
  credentials_by_type: { licenses, certifications, dea, malpractice },
  top_issues: [{ type, count, examples }]
}
```

#### GET /dashboard/alerts
Get alerts sorted by urgency
```
Query Params: limit (default 20)
Response: {
  data: [{
    id, provider_name, credential_type, alert_type, alert_date,
    days_until_expiry, priority, status
  }]
}
```

#### GET /dashboard/compliance-by-specialty
Get compliance metrics grouped by specialty
```
Response: {
  data: [{
    specialty, total_providers, compliant_count,
    compliant_percentage, avg_score, alerts_count
  }]
}
```

### Report Endpoints

#### GET /reports/expiration-calendar
Export expiration calendar view
```
Query Params:
  month: int (1-12)
  year: int
  facility_id?: uuid

Response: {
  data: [{
    date, provider_id, provider_name, credential_type,
    credential_name, days_until_expiry
  }]
}
```

#### GET /reports/compliance-summary
Get compliance report
```
Query Params:
  facility_id?: uuid
  date_from?: date
  date_to?: date

Response: {
  data: [{
    provider_id, provider_name, specialty, npi,
    licenses_compliant, certifications_compliant, dea_compliant,
    malpractice_compliant, privileges_compliant,
    compliance_score, issues: [...]
  }],
  summary: { total_compliant, total_non_compliant, percentage }
}
```

#### GET /reports/export-csv
Export data to CSV
```
Query Params:
  report_type: 'providers' | 'licenses' | 'expiring' | 'compliance'
  facility_id?: uuid
  date_from?: date
  date_to?: date

Response: CSV file (text/csv)
```

#### GET /reports/export-excel
Export data to Excel
```
Query Params: (same as CSV)
Response: Excel file (application/vnd.ms-excel)
```

#### GET /reports/audit-trail
Export audit log
```
Query Params:
  user_id?: uuid
  resource_type?: string
  action?: 'CREATE' | 'UPDATE' | 'DELETE'
  date_from?: date
  date_to?: date
  limit?: int (max 10000)

Response: { data: [{...audit entries}], total }
```

### Background Job Endpoints

#### POST /jobs/check-expirations
Manually trigger expiration check (Admin only)
```
Response: { success: true, checked_count, alerts_created }
Status: 202 Accepted (async)
```

#### POST /jobs/send-pending-alerts
Manually send pending alerts (Admin only)
```
Response: { success: true, sent_count }
Status: 202 Accepted (async)
```

#### GET /jobs/status/:jobId
Get background job status
```
Response: { job_id, status: 'pending' | 'processing' | 'completed' | 'failed', progress, ... }
```

---

# 5. FRONTEND COMPONENT ARCHITECTURE

## Directory Structure
```
src/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorAlert.jsx
│   │   └── ConfirmDialog.jsx
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── AlertFeed.jsx
│   │   ├── ComplianceChart.jsx
│   │   └── QuickFilter.jsx
│   ├── Providers/
│   │   ├── ProviderDirectory.jsx
│   │   ├── ProviderSearchBar.jsx
│   │   ├── ProviderTable.jsx
│   │   ├── ProviderProfile.jsx
│   │   ├── ProviderForm.jsx
│   │   ├── LicensesTab.jsx
│   │   ├── CertificationsTab.jsx
│   │   ├── DEATab.jsx
│   │   ├── MalpracticeTab.jsx
│   │   ├── PrivilegesTab.jsx
│   │   ├── DocumentsTab.jsx
│   │   ├── TasksTab.jsx
│   │   ├── ActivityLogTab.jsx
│   │   ├── CredentialForm.jsx
│   │   └── DocumentUpload.jsx
│   ├── Alerts/
│   │   ├── AlertList.jsx
│   │   ├── AlertCard.jsx
│   │   └── AlertConfigForm.jsx
│   ├── Reports/
│   │   ├── ReportSelector.jsx
│   │   ├── ComplianceSummary.jsx
│   │   ├── ExpirationCalendar.jsx
│   │   ├── ExportButton.jsx
│   │   └── ReportTable.jsx
│   └── Auth/
│       ├── LoginForm.jsx
│       ├── RegisterForm.jsx
│       └── ProtectedRoute.jsx
├── pages/
│   ├── DashboardPage.jsx
│   ├── ProvidersPage.jsx
│   ├── ProviderDetailPage.jsx
│   ├── AlertsPage.jsx
│   ├── AlertConfigPage.jsx
│   ├── ReportsPage.jsx
│   ├── LoginPage.jsx
│   ├── NotFoundPage.jsx
│   └── UnauthorizedPage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useProviders.js
│   ├── useLicenses.js
│   ├── useAlerts.js
│   ├── useFetch.js
│   └── useLocalStorage.js
├── services/
│   ├── api.js (axios instance with interceptors)
│   ├── authService.js
│   ├── providerService.js
│   ├── licenseService.js
│   ├── alertService.js
│   ├── reportService.js
│   └── documentService.js
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
├── utils/
│   ├── dateUtils.js
│   ├── formatters.js
│   ├── validators.js
│   ├── constants.js
│   └── errorHandler.js
├── styles/
│   ├── tailwind.config.js
│   ├── globals.css
│   └── theme.css
├── App.jsx
└── main.jsx
```

## Key Components Specifications

### Dashboard.jsx
```
Purpose: Main overview screen showing KPIs and alert feed
Layout: 
  - Top: Summary cards (4 cards) - total providers, expiring, expired, compliant %
  - Middle: Compliance by specialty chart (pie or bar)
  - Bottom: Alert feed (list, paginated, 10 per page)
  - Right sidebar: Quick filters (specialty, facility, status)

Features:
  - Cards update via real-time polling (15-second interval)
  - Click card to go to filtered provider list
  - Click alert to go to provider profile
  - Loading skeleton while fetching
  - Error boundary with retry button
```

### ProviderDirectory.jsx
```
Purpose: Searchable, filterable list of all providers
Layout:
  - Search bar (top) - searches by name, NPI
  - Filter sidebar (left) - specialty, facility, status, compliance score range
  - Responsive table (main) - columns: name, NPI, specialty, status, compliance badge, actions
  - Pagination controls

Features:
  - Real-time search (debounce 300ms)
  - Column sorting (click header)
  - Bulk select checkbox (for future bulk operations)
  - Click row to open provider profile
  - Add new provider button (top right)
  - Compliance badge: green (>90%), yellow (70-90%), red (<70%)
  - Export selected data button
```

### ProviderProfile.jsx
```
Purpose: Detailed view of single provider with all credentials
Layout: Tabbed interface
  Tabs: Licenses | Certifications | DEA | Malpractice | Privileges | Documents | Tasks | Activity Log
  
Each credential tab includes:
  - List of credentials (cards or rows)
  - Add new button
  - Edit inline button
  - Delete button
  - Status badge (active, expiring, expired)
  - Days until expiry badge (green/yellow/red)
  - Document upload area

Features:
  - Tabbed navigation (sticky)
  - Provider info header (name, NPI, specialty, status)
  - Edit provider button (modal form)
  - Quick compliance score on top
  - Task list panel (right sidebar, fixed)
  - Activity timeline (last column shows who changed what when)
```

### AlertList.jsx
```
Purpose: Centralized alert management
Features:
  - Filter by: alert type, status, priority, provider, credential type
  - Sort by: date, priority, provider name
  - Pagination (20 per page)
  - Bulk acknowledge button
  - Alert card: provider name, credential, days until expiry, priority (color), status
  - Click to open provider profile
  - Search by provider name
```

### ReportSelector.jsx
```
Purpose: Interface to generate and export reports
Options:
  1. Compliance Summary - table with all providers + compliance score
  2. Expiration Calendar - calendar grid showing expirations by date
  3. Compliance by Specialty - grouped by specialty with averages
  4. Audit Trail - full audit log export

Features:
  - Date range picker (optional, per report)
  - Facility filter (optional)
  - Export format selector: CSV, Excel, PDF (if time)
  - Preview button (shows first 10 rows)
  - Export button (downloads file)
  - Loading progress (for large exports)
```

## Tailwind CSS Configuration

### Color Scheme
```javascript
colors: {
  primary: '#1e3a8a',      // Navy blue (sidebar, buttons)
  secondary: '#0f172a',    // Dark blue (header)
  accent: '#3b82f6',       // Bright blue (links, highlights)
  success: '#10b981',      // Green (compliant)
  warning: '#f59e0b',      // Amber (warning)
  danger: '#ef4444',       // Red (critical)
  neutral: '#f3f4f6',      // Light gray (backgrounds)
}
```

### Typography
```css
Font: Inter (sans-serif)
Body: 14px, line-height 1.6
Heading 1: 32px, bold
Heading 2: 24px, bold
Heading 3: 18px, bold
Label: 12px, uppercase, tracking-wide
```

---

# 6. BUSINESS LOGIC & WORKFLOWS

## 6.1 Expiration Check Workflow

### Nightly Job (Scheduled daily at 2 AM)
```
1. Query all active credentials (licenses, certs, DEA, malpractice, privileges)
   WHERE expiry_date >= TODAY AND expiry_date <= TODAY + 90 days

2. For each credential, calculate days_until_expiry

3. Determine alert_type based on days_until_expiry:
   - 90 days: alert_type = 'expiring_90'
   - 60 days: alert_type = 'expiring_60'
   - 30 days: alert_type = 'expiring_30'
   - 7 days: alert_type = 'expiring_7'
   - 0 days: alert_type = 'expired'

4. Check if alert already exists for this credential at this threshold
   - If exists and status='sent': skip
   - If exists and status='pending': resend
   - If doesn't exist: create new alert

5. Create or update alert record
   - Set status = 'pending'
   - Add to send queue

6. Queue email notifications
   - Get alert config for this alert_type
   - Send email to recipients
   - Mark alert status = 'sent'
   - Set sent_at timestamp

7. Log job completion
   - alerts_created, alerts_updated, emails_sent
```

## 6.2 Document Upload Workflow

### When provider uploads new license/cert/DEA:
```
1. Validate file
   - Check file type (PDF, JPG, PNG only)
   - Check file size (<50MB)
   - Validate MIME type

2. Calculate file hash (SHA-256)
   - Use for integrity verification later

3. Upload to S3
   - Create key: {provider_id}/{credential_type}/{timestamp}_{filename}
   - Set server-side encryption (AES-256)
   - Set expiry metadata (if applicable)

4. Create document record in DB
   - file_path = S3 key
   - document_type = detected from context
   - uploaded_by = current user
   - is_latest = TRUE
   - Set previous version's is_latest = FALSE

5. Update related credential
   - Find credential by document_type
   - Set credential.document_id = new_document.id
   - Update credential.psv_status = 'pending_verification'
   - Update credential.updated_at = NOW

6. Create audit log entry
   - action = 'DOCUMENT_UPLOADED'
   - resource_type = 'document'
   - new_values = {file_name, file_size, document_type}

7. Create task (if manual verification needed)
   - task_type = 'verification'
   - assigned_to = coordinator
   - due_date = NOW + 2 days

8. Return success response with document metadata
```

## 6.3 Compliance Score Calculation

### Triggered: On any credential change, nightly update
```
For each provider:

total_points = 0
max_points = 0

For each credential type:
  - License:
    - Max 25 points
    - If active & not expired & psv_verified: 25
    - If active but expiring <30 days: 10
    - If expired: 0
    - If no license: 0
  
  - Certification:
    - Max 20 points
    - Same logic as license
  
  - DEA:
    - Max 20 points
    - Same logic
  
  - Malpractice Insurance:
    - Max 20 points
    - If active & not expired & with tail coverage: 20
    - If active but no tail coverage: 10
    - If expired: 0
    - If none: 0
  
  - Privileges:
    - Max 15 points
    - If all approved & not expired: 15
    - If any expired: 5
    - If any denied/suspended: 0

compliance_score = (total_points / max_points) * 100
  - Clamp to 0-100
  - Update providers.compliance_score
```

## 6.4 Task Auto-Assignment Workflow

### When alert created for 30-day or 7-day threshold:
```
1. Create task record
   - task_type = 'credential_renewal'
   - related_credential_id = credential.id
   - title = "{Provider Name} - {Credential} renewal due in {days} days"
   - due_date = credential.expiry_date - 5 days

2. Assign to coordinator
   - assigned_to = (get from alert_config) OR (provider.assigned_coordinator)
   - If none, assign to first coordinator in org

3. Create in_app notification
   - Send to assigned user
   - Send to provider (if enabled)

4. If 7-day alert: escalate to medical director
   - Create second task
   - assigned_to = medical_director
   - priority = 'high'
```

---

# 7. SECURITY & COMPLIANCE

## 7.1 Authentication & Authorization
- JWT tokens with RS256 (asymmetric) signature
- Access token: 1 hour expiry
- Refresh token: 7 days expiry, stored in HTTPOnly secure cookie
- Password: bcrypt with salt rounds = 12
- Rate limiting: 5 failed login attempts → 15-min lockout
- RBAC: 5 roles with explicit permission checks on each endpoint

## 7.2 Data Encryption
- **At Rest**: PostgreSQL with pgcrypto extension
  - SSN, DOB encrypted with AES-256
  - Documents encrypted in S3 (server-side)
  
- **In Transit**: TLS 1.2+ on all endpoints
  - HSTS header enabled
  - Cert pinning optional (for mobile later)

## 7.3 HIPAA Compliance
- **PHI Data**: SSN, DOB, malpractice claims history
- **Access Controls**: User role-based, logged
- **Audit Trail**: All PHI access logged with user, timestamp, IP
- **Retention**: Keep audit logs 7+ years
- **Data Minimization**: Only collect/store required fields
- **Breach Notification**: Auto-alert if unauthorized access detected
- **Backup/Recovery**: Daily encrypted backups, tested monthly

## 7.4 Input Validation
- Sanitize all inputs server-side
- Validate email, phone, date formats
- Reject SQL injection attempts
- Validate file uploads (type, size, MIME)
- Rate limiting: 100 requests/min per IP

## 7.5 CSRF Protection
- Use token-based CSRF protection
- Same-site cookie policy: 'strict'
- No GET for state-changing operations

## 7.6 CORS
- Whitelist specific origins (not *)
- Allow credentials in cross-origin requests
- Preflight caching: 86400 seconds

---

# 8. ERROR HANDLING & VALIDATION

## Error Codes & HTTP Status
```
400 Bad Request - Validation error, malformed request
401 Unauthorized - Invalid/missing JWT
403 Forbidden - Authenticated but no permission
404 Not Found - Resource doesn't exist
409 Conflict - Duplicate unique constraint (e.g., duplicate NPI)
422 Unprocessable Entity - Validation errors on fields
429 Too Many Requests - Rate limited
500 Internal Server Error - Unhandled server error
503 Service Unavailable - Database/external service down
```

## Input Validation Rules

### Provider Fields
```
npi: Required, 10 digits, unique, regex /^\d{10}$/
first_name, last_name: Required, 1-100 chars, no special chars
email: Required, valid email format, unique
specialty: Required, from predefined list
date_of_birth: Optional, valid date, age >= 21
ssn: Encrypted, 9 digits, unique
employment_type: Enum: full_time, part_time, contractor, locum
```

### Credential Fields
```
license_number: Required, 3-50 chars, alphanumeric
state: Required, 2-char state code
issue_date: Required, valid date, must be <= today
expiry_date: Required, valid date, must be > issue_date and > today
status: Enum validation
```

### Document Upload
```
file: Required, max 50MB, types: PDF, JPG, PNG
document_type: Required, enum
document_expiry_date: Optional, if provided must be > today
```

## Validation Libraries
- **Frontend**: Zod or Yup
- **Backend**: Joi or Zod
- **Database**: Constraints + application-level validation

---

# 9. TESTING STRATEGY

## Frontend Testing (Vitest + React Testing Library)

### Component Tests
```
- Dashboard.test.jsx: Render, fetch data, display summary cards
- ProviderTable.test.jsx: Render with data, pagination, sorting, filtering
- ProviderForm.test.jsx: Form submission, validation errors, submit handler
- DocumentUpload.test.jsx: File upload, validation, error handling
```

### Hook Tests
```
- useAuth.test.js: Login, logout, token refresh, permission checks
- useFetch.test.js: Success response, error handling, retry logic
- useLocalStorage.test.js: Store/retrieve, clear, expiry
```

### Coverage Targets
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Backend Testing (Jest + Supertest)

### Unit Tests
```
- Middleware tests: auth, errorHandler, logging
- Service tests: expiration calculation, compliance score, alert generation
- Validator tests: input validation rules
```

### Integration Tests
```
- Auth routes: login, register, refresh, logout
- Provider CRUD: create, read, update, delete, list with filters
- License CRUD
- Alert generation: nightly job simulation
- Document upload
```

### Test Database
- Use separate PostgreSQL instance for tests
- Clear between tests with `TRUNCATE` cascade
- Seed with consistent test data

### Coverage Targets
- Statements: 80%
- Critical paths (auth, alerts): 100%

## E2E Testing (Playwright or Cypress - Optional)

### User Flows
```
1. Login flow
2. Search and filter providers
3. View provider details
4. Upload document
5. Generate report
6. Acknowledge alert
```

---

# 10. DEPLOYMENT & DEVOPS

## Development Environment

### Docker Compose Setup
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ['5173:5173']
    environment:
      VITE_API_URL: http://localhost:3001
    volumes: ['./frontend/src:/app/src']
    
  backend:
    build: ./backend
    ports: ['3001:3001']
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://user:pass@db:5432/credvault
      JWT_SECRET: dev-secret-key-not-for-production
    depends_on:
      - db
    volumes: ['./backend/src:/app/src']
    
  db:
    image: postgres:15-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_DB: credvault
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    
  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    
  s3-mock: # MinIO for local S3
    image: minio/minio
    ports: ['9000:9000', '9001:9001']
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes: ['minio-data:/minio-data']
    command: server /minio-data --console-address ":9001"

volumes:
  postgres-data:
  minio-data:
```

### Startup
```bash
docker-compose up -d
docker-compose exec db psql -U user -d credvault -f scripts/init.sql
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
# Frontend on http://localhost:5173, Backend on http://localhost:3001
```

## Production Environment

### Deployment Architecture
```
CloudFlare (DDoS protection, caching)
  ↓
AWS ALB (load balancer)
  ↓
ECS Fargate Cluster (auto-scaling)
  ├─ Frontend (Nginx serving React SPA)
  └─ Backend (Node.js API)
  ↓
RDS PostgreSQL (managed, auto-backup)
↓
S3 (document storage, encrypted)
```

### CI/CD Pipeline (GitHub Actions)

#### On Push to Main
```yaml
1. Run tests (Jest, Vitest)
2. Run linting (ESLint, Prettier)
3. Build Docker images (frontend, backend)
4. Push to ECR (AWS Elastic Container Registry)
5. Deploy to ECS (rolling update, blue-green)
6. Run smoke tests
7. Monitor for errors (Sentry, CloudWatch)
```

### Environment Variables
```
Development:  .env.local (in .gitignore)
Production:   AWS Secrets Manager
              DATABASE_URL, JWT_SECRET, AWS_ACCESS_KEY, etc.
```

### Database Migrations
```bash
# Development
npm run migrate:dev

# Production (run before deployment)
npm run migrate:prod
```

---

# 11. CODE STRUCTURE & CONVENTIONS

## Backend (Node.js/Express)

### Folder Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── providerController.js
│   │   ├── licenseController.js
│   │   └── ...
│   ├── services/
│   │   ├── authService.js
│   │   ├── providerService.js
│   │   ├── alertService.js
│   │   └── credentialService.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validation.js
│   ├── models/
│   │   ├── index.js (Sequelize instance)
│   │   ├── Provider.js
│   │   ├── License.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── providers.js
│   │   ├── alerts.js
│   │   ├── reports.js
│   │   └── index.js (main router)
│   ├── jobs/
│   │   ├── expirationCheckJob.js
│   │   ├── alertSenderJob.js
│   │   └── scheduler.js (node-schedule)
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   ├── errorMessages.js
│   │   └── logger.js
│   ├── config/
│   │   ├── database.js
│   │   ├── s3.js
│   │   ├── jwt.js
│   │   └── email.js
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── scripts/
│   ├── init.sql (database initialization)
│   └── seed.js (test data)
├── migrations/
│   ├── 001-init.sql
│   ├── 002-add-audit-log.sql
│   └── ...
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

### Naming Conventions
```
Functions: camelCase
  getProvider, calculateComplianceScore, checkExpirations

Classes: PascalCase
  Provider, LicenseService, AuthMiddleware

Constants: UPPER_SNAKE_CASE
  JWT_EXPIRY, MAX_FILE_SIZE, ALERT_TYPES

Files: kebab-case
  provider-controller.js, compliance-service.js
  OR PascalCase for classes: Provider.js
```

### Coding Style
- Use async/await (not callbacks)
- Error handling: Try/catch with custom error classes
- No null checks, use optional chaining (?.)
- No var, use const/let
- No console.log, use logger
- Comment only "why", not "what"
- Max function length: 30 lines
- Max file length: 500 lines

### Example Controller
```javascript
// controllers/providerController.js
const { Provider, License } = require('../models');
const { notFound, validationError } = require('../utils/errors');
const logger = require('../utils/logger');

const getProviders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, specialty, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) where[Op.or] = [
      { first_name: { [Op.iLike]: `%${search}%` } },
      { npi: { [Op.iLike]: `%${search}%` } }
    ];
    if (specialty) where.specialty = specialty;
    if (status) where.status = status;
    
    const { rows, count } = await Provider.findAndCountAll({
      where,
      offset,
      limit,
      order: [['last_name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page, limit, total: count, pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProviders, /* ... */ };
```

## Frontend (React)

### Naming Conventions
```
Components: PascalCase
  Dashboard.jsx, ProviderTable.jsx, CredentialForm.jsx

Hooks: camelCase starting with 'use'
  useProviders.js, useLocalStorage.js, useFetch.js

Utils, services: camelCase
  dateUtils.js, providerService.js

Constants: UPPER_SNAKE_CASE
  ALERT_TYPES, CREDENTIAL_TYPES
```

### Component Structure
```javascript
// Dashboard.jsx
import { useEffect, useState } from 'react';
import SummaryCards from './SummaryCards';
import AlertFeed from './AlertFeed';
import { useDashboard } = './hooks/useDashboard';

function Dashboard() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="p-8 space-y-6">
      <SummaryCards data={data.summary} />
      <AlertFeed alerts={data.alerts} />
    </div>
  );
}

export default Dashboard;
```

---

# 12. PERFORMANCE OPTIMIZATION

## Frontend
- Code splitting: Lazy load routes with React.lazy()
- Image optimization: Convert PNGs to WebP
- Memoization: useMemo for expensive calculations
- Virtualization: Use react-window for large lists (>100 items)
- Caching: Cache API responses in Context or localStorage
- Debounce: Search input (300ms), resize handlers
- Service Worker: Offline support (optional)

## Backend
- Database indexing: On all WHERE, JOIN, ORDER BY columns
- Connection pooling: 30 connections by default
- Query optimization: Use `select()` to fetch only needed columns
- Caching: Redis for alert config, compliance scores (1-hour TTL)
- Pagination: Always limit result sets (max 1000)
- Batch operations: Bulk insert/update for alerts
- Async processing: Move heavy jobs to background queue
- CDN: Serve static assets (documents) via CloudFront

## Monitoring
- Response time: Target <500ms for 95th percentile
- Database query time: <100ms for common queries
- Memory usage: Alert if >80% of container limit
- API rate limits: 1000 req/min per IP
- Error rate: Alert if >1% of requests fail

---

# 13. MONITORING & LOGGING

## Application Logs
```
Format: JSON (for easy parsing)
Levels: DEBUG, INFO, WARN, ERROR, FATAL
Retention: 30 days in CloudWatch
Transport: Winston with CloudWatch Logs transport
```

### Example Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "Provider created successfully",
  "provider_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "request_id": "req_123abc",
  "duration_ms": 145
}
```

## Metrics & Alerting
```
CloudWatch Metrics:
  - API response time (avg, p95, p99)
  - Error rate (%)
  - Database connection pool utilization (%)
  - S3 upload/download latency
  - Background job execution time
  - Alert generation count (daily)
  
Alarms (trigger PagerDuty):
  - Error rate > 5% for 5 minutes
  - Response time p95 > 2 seconds
  - Database connection pool > 90%
  - Daily backup failed
  - Disk usage > 80%
```

## Health Checks
```
GET /health (public)
  Returns: { status: 'healthy' | 'degraded', timestamp, version }

GET /health/db (auth required)
  Tests database connectivity

GET /health/s3 (auth required)
  Tests S3 connectivity
```

---

# 14. THIRD-PARTY INTEGRATIONS

## Email Service
- **Provider**: AWS SES or SendGrid
- **Purpose**: Send alert emails, renewal reminders
- **Template**: Use SendGrid templates or handlebars
- **Rate limit**: Max 14 emails/second (SES standard)

## File Storage
- **Provider**: AWS S3 (production) or MinIO (dev)
- **Bucket**: `credvault-{environment}-documents`
- **Encryption**: Server-side AES-256
- **Versioning**: Enabled for document recovery

## Error Tracking (Optional)
- **Provider**: Sentry
- **DSN**: From environment config
- **Sampling**: 10% of transactions (can increase for errors)

## Analytics (Optional)
- **Provider**: Segment or Mixpanel
- **Events**: User signup, provider created, report generated
- **PII**: Do NOT track SSN, DOB

---

# 15. SAMPLE DATA & SEEDING

## Seed Script (backend/scripts/seed.js)
```javascript
// Creates 10 sample providers with realistic data
const providers = [
  {
    npi: '1234567890',
    first_name: 'John',
    last_name: 'Smith',
    specialty: 'Cardiology',
    email: 'john.smith@hospital.com',
    employment_type: 'full_time',
    status: 'active',
    licenses: [{
      state: 'NY',
      license_number: 'NY123456',
      issue_date: '2015-01-01',
      expiry_date: '2025-06-30',
      status: 'active'
    }],
    dea: [{
      dea_number: 'AS1234567',
      state: 'NY',
      expiry_date: '2025-12-31',
      schedules_authorized: '1,2,3,4,5'
    }],
    malpractice: [{
      carrier: 'The Doctors Company',
      policy_number: 'POL123456',
      coverage_per_claim: 1000000,
      aggregate_limit: 5000000,
      expiry_date: '2024-12-31',
      tail_coverage: true
    }]
  },
  // ... 9 more providers
];

// Run with: npm run seed
```

---

# BUILD CHECKLIST

## Phase 1: Setup & Infrastructure (Week 1)
- [ ] Create GitHub repo + branch protection rules
- [ ] Set up Docker environment (compose file)
- [ ] Initialize Express backend with basic middleware
- [ ] Initialize React frontend with Vite
- [ ] Create PostgreSQL schema
- [ ] Set up CI/CD pipeline (GitHub Actions)

## Phase 2: Backend Core (Week 2-3)
- [ ] Implement authentication (JWT, bcrypt, refresh tokens)
- [ ] Build all CRUD endpoints (providers, licenses, etc.)
- [ ] Implement input validation (Joi/Zod)
- [ ] Set up error handling middleware
- [ ] Implement audit logging
- [ ] Write integration tests

## Phase 3: Frontend Core (Week 2-3)
- [ ] Build layout (header, sidebar, main area)
- [ ] Implement login/logout flow
- [ ] Build dashboard (summary cards, alert feed)
- [ ] Build provider directory (search, filter, table)
- [ ] Build provider profile (tabs for each credential)

## Phase 4: Alert System (Week 4)
- [ ] Implement nightly expiration check job
- [ ] Build alert creation logic
- [ ] Implement email sending
- [ ] Build alert UI (list, acknowledge)
- [ ] Build alert configuration page

## Phase 5: Document Management (Week 4-5)
- [ ] Implement S3 integration (or MinIO for dev)
- [ ] Build document upload (drag-drop)
- [ ] Implement file validation
- [ ] Build document list/delete UI
- [ ] Implement version control

## Phase 6: Reporting (Week 5)
- [ ] Implement compliance score calculation
- [ ] Build expiration calendar view
- [ ] Build compliance summary report
- [ ] Implement CSV/Excel export
- [ ] Build audit trail view

## Phase 7: Testing & Polish (Week 6)
- [ ] Write unit tests (backend services)
- [ ] Write integration tests (API endpoints)
- [ ] Write component tests (React)
- [ ] Implement error boundaries
- [ ] Load testing (performance)
- [ ] Security audit

## Phase 8: Deployment (Week 7)
- [ ] Set up AWS infrastructure (RDS, S3, ECS)
- [ ] Configure SSL/TLS certificates
- [ ] Set up monitoring (CloudWatch, Sentry)
- [ ] Set up backups & disaster recovery
- [ ] Deploy to production
- [ ] Monitor for issues

---

# SUCCESS METRICS

- Launch with 0 critical bugs
- Support 1000+ providers without degradation
- Response time <500ms for 95th percentile
- Uptime 99.9% month 1
- Users complete common workflows in <2 minutes
- 80%+ test coverage
- 0 HIPAA compliance violations
- Users save 5+ hours/week on credential management

---

# FINAL NOTES

This is a **comprehensive build specification**. A team of 2-3 developers can build this in 6-8 weeks with this roadmap. The spec includes everything needed:
- Full database schema with indexes
- Complete API specifications (40+ endpoints)
- Frontend architecture with components
- Business logic workflows
- Security & compliance requirements
- Testing & deployment strategies

Start with **Phase 1 (setup)**, then proceed sequentially. Don't skip testing—build tests alongside code.

Good luck! 🚀
