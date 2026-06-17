# CredVault: Healthcare Provider Credentialing Management System

## Project Overview

**CredVault** is a centralized healthcare provider credentialing and license management system designed to track, manage, verify, and report on healthcare provider credentials including licenses, certifications, DEA registrations, and malpractice insurance.

### Key Success Criteria
- Support 1000+ providers without performance degradation
- Send alerts 90/60/30/7 days before credential expiration
- Generate compliance reports in <5 seconds
- Support document uploads up to 50MB
- Maintain 99.9% uptime
- Comply with HIPAA security standards
- Zero credential data loss

## Tech Stack

### Frontend
- **Framework**: React 18+ with hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3+
- **State Management**: React Context + custom hooks
- **HTTP Client**: Axios with interceptors
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns or Day.js
- **Tables**: TanStack React Table
- **Charts**: Recharts or Chart.js
- **File Upload**: React Dropzone
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.18+
- **Language**: JavaScript (ES6+) or TypeScript
- **ORM**: Sequelize or TypeORM
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or MinIO (dev)
- **Job Queue**: Node-schedule or Bull Redis
- **Validation**: Joi or Zod
- **Logging**: Winston + Pino
- **API Documentation**: Swagger/OpenAPI

### Database & Infrastructure
- **Database**: PostgreSQL 14+
- **Connection Pool**: pg-pool (30 connections default)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: AWS (EC2 + RDS + S3) OR DigitalOcean OR self-hosted
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt with auto-renewal

## Core Features

### 1. Provider Management
- Complete provider directory with search and filtering
- Multi-facility support
- Employment type tracking (full-time, part-time, contractor, locum)
- Compliance score calculation (0-100)
- Soft delete support with audit trail

### 2. Credential Management
- **Licenses**: State-specific medical licenses with verification status
- **Certifications**: Board certifications and specialty certifications
- **DEA Registrations**: Drug scheduling authorization tracking
- **Malpractice Insurance**: Coverage, limits, tail coverage, and retroactive dates
- **Privileges**: Facility-specific clinical privileges with procedure codes
- Document versioning and integrity verification (SHA-256)

### 3. Alert System
- Automated expiration alerts (90/60/30/7 days before, and expired)
- Configurable alert recipients (email, SMS, in-app)
- Priority levels (low, medium, high, critical)
- Alert acknowledgment workflow
- Test alert functionality

### 4. Document Management
- Secure file uploads (up to 50MB)
- Document versioning with latest-flag tracking
- S3 integration with server-side encryption (AES-256)
- Document integrity verification (SHA-256 hash)
- Metadata tracking (issuer, credential_id, verification_status)

### 5. Reporting & Compliance
- Compliance summary report (by provider and specialty)
- Expiration calendar view (by month/year)
- Audit trail export (7+ years retention)
- CSV/Excel export functionality
- Specialty-based compliance analysis

### 6. Background Jobs
- Nightly expiration check (scheduled daily at 2 AM)
- Automatic alert generation and sending
- Compliance score recalculation
- Email notification queue

## Database Schema

### Core Tables
1. **users** - System users with roles (admin, coordinator, director, hr, auditor)
2. **providers** - Healthcare providers with employment and status info
3. **licenses** - State medical licenses with PSV status
4. **certifications** - Board and specialty certifications
5. **dea_registrations** - DEA registration and drug schedules
6. **malpractice_insurance** - Coverage, carrier, policy details
7. **privileges** - Facility-specific clinical privileges
8. **documents** - Uploaded credentials with versioning
9. **alerts** - Expiration and status alerts
10. **tasks** - User-assigned credential management tasks
11. **facilities** - Facility information and NPI
12. **audit_log** - Complete audit trail for compliance
13. **alert_config** - Alert configuration per type

### Key Indexes
- All WHERE, JOIN, and ORDER BY columns indexed
- Composite indexes for (provider_id, facility_id)
- Expiry date indexes for alert queries

## API Architecture

### Base URL
- Development: `http://localhost:3001/api/v1`
- Production: `https://api.credvault.com/api/v1`

### Response Format
All endpoints return standardized JSON:
```json
{
  "success": true,
  "data": { /* payload */ },
  "error": null,
  "timestamp": "ISO-8601",
  "requestId": "req_123abc"
}
```

### Authentication
- JWT with RS256 signature (asymmetric)
- Access token: 1 hour expiry
- Refresh token: 7 days expiry (HTTPOnly cookie)
- Rate limiting: 5 failed attempts → 15-min lockout

### Core Endpoint Groups (40+ total)
- **Auth**: Register, Login, Refresh, Logout
- **Providers**: CRUD with filtering/search, bulk operations
- **Credentials**: CRUD for licenses, certifications, DEA, malpractice
- **Privileges**: Facility-specific clinical privileges
- **Documents**: Upload, list, delete with versioning
- **Tasks**: Assignment, status tracking, completion
- **Alerts**: List, acknowledge, test, configuration
- **Dashboard**: Summary metrics, compliance charts
- **Reports**: Expiration calendar, compliance summary, audit trail, CSV/Excel exports
- **Jobs**: Manual triggers for background processes

## Security & Compliance

### HIPAA Requirements
- **PHI Data**: SSN, DOB, malpractice claims history encrypted at rest
- **Access Controls**: Role-based (RBAC), user-logged
- **Audit Trail**: All PHI access logged with user, timestamp, IP
- **Encryption**: AES-256 at rest, TLS 1.2+ in transit
- **Retention**: Audit logs 7+ years
- **Breach Notification**: Auto-alert on unauthorized access
- **Backups**: Daily encrypted backups, tested monthly

### Authentication & Authorization
- 5 user roles with explicit permission checks
- Password: bcrypt with 12 salt rounds
- CSRF protection with token-based approach
- CORS: Whitelisted specific origins
- HSTS header enabled
- HTTPOnly, Secure, SameSite cookies

### Data Protection
- SSN encryption with pgcrypto (PostgreSQL)
- S3 documents encrypted with server-side AES-256
- File hash verification (SHA-256)
- Input validation and sanitization
- SQL injection prevention

## Frontend Architecture

### Directory Structure
```
src/
├── components/
│   ├── common/ (Header, Sidebar, Layout, Spinners, Dialogs)
│   ├── Dashboard/ (Summary cards, Alerts, Charts)
│   ├── Providers/ (Directory, Profile, Forms, Tabs)
│   ├── Alerts/ (List, Config)
│   ├── Reports/ (Selector, Summary, Calendar)
│   └── Auth/ (Login, Register, ProtectedRoute)
├── pages/ (Route-mapped components)
├── hooks/ (useAuth, useFetch, useProviders, useAlerts, etc.)
├── services/ (API integration, axios client)
├── context/ (AuthContext, NotificationContext)
├── utils/ (Formatters, Validators, Date helpers)
└── styles/ (Tailwind config, globals, theme)
```

### Key Pages
1. **Dashboard** - KPI cards, compliance charts, alert feed
2. **Provider Directory** - Searchable/filterable list with pagination
3. **Provider Profile** - Tabbed interface for all credentials
4. **Alerts** - Centralized alert management with filtering
5. **Reports** - Report selection, preview, and export
6. **Alert Configuration** - Alert type setup and recipients

### UI/UX Design
- **Color Scheme**: Navy (#1e3a8a), Dark blue (#0f172a), Bright blue (#3b82f6), Green (#10b981), Amber (#f59e0b), Red (#ef4444)
- **Typography**: Inter font, semantic sizing (12px labels to 32px headings)
- **Compliance Badges**: Green (>90%), Yellow (70-90%), Red (<70%)
- **Status Indicators**: Visual badges for active/expired/expiring states

## Business Logic

### Expiration Check Workflow
1. **Daily Job** (2 AM): Query credentials expiring within 90 days
2. **Alert Classification**: Categorize by days remaining (90/60/30/7/0)
3. **Deduplication**: Check for existing alerts, skip if sent
4. **Alert Creation**: Create new or update pending alerts
5. **Email Queue**: Send based on alert configuration
6. **Status Update**: Mark alerts as sent

### Document Upload Workflow
1. **Validation**: File type, size, MIME check
2. **Hashing**: SHA-256 for integrity verification
3. **S3 Upload**: Encrypted, with metadata
4. **DB Record**: Create document with versioning
5. **Credential Update**: Link to credential, set PSV status
6. **Task Creation**: Auto-assign verification task
7. **Audit Log**: Track upload action

### Compliance Score Calculation
- **License**: 25 points (active=25, expiring<30=10, expired=0)
- **Certification**: 20 points (same logic)
- **DEA**: 20 points (same logic)
- **Malpractice**: 20 points (with tail=20, no tail=10, expired=0)
- **Privileges**: 15 points (approved=15, any expired=5, denied=0)
- **Formula**: (total_points / max_points) × 100, clamped to 0-100

## Testing Strategy

### Backend Testing (Jest + Supertest)
- **Unit Tests**: Middleware, validators, business logic
- **Integration Tests**: All CRUD endpoints, alert generation
- **Test Database**: Separate PostgreSQL, cleared between tests
- **Coverage**: 80% statements, 75% branches, 100% for critical paths

### Frontend Testing (Vitest + React Testing Library)
- **Component Tests**: Render, interactions, validation
- **Hook Tests**: Auth, fetch, storage
- **Coverage**: 80% statements, 75% branches, 80% functions

## Development Workflow

### Local Setup
```bash
# Clone and install
git clone <repo>
cd project
npm install

# Start services (Docker Compose)
docker-compose up -d

# Database setup
npm run migrate:dev
npm run seed:dev

# Run dev servers
npm run dev          # Both frontend and backend
npm run dev:frontend # Frontend only (port 5173)
npm run dev:backend  # Backend only (port 3001)
```

### Git Workflow
- Branch off main for features/fixes
- Commit messages: descriptive, imperative mood
- PRs require passing tests and code review
- Squash commits before merge
- Tag releases with semantic versioning

## Performance Targets

### Frontend
- Bundle size: <250KB (gzipped)
- Largest route chunk: <100KB
- First meaningful paint: <2 seconds
- Time to interactive: <3 seconds
- Lighthouse score: >80

### Backend
- API response: <500ms (95th percentile)
- Database queries: <100ms for common queries
- Alert generation job: <5 minutes for 1000+ providers
- Document upload: <10 seconds for 50MB file
- Memory usage: <500MB per container

### Database
- Query execution: <100ms (after indexes)
- Connection pool: 30 connections by default
- Backup time: <15 minutes for 1GB database

## Monitoring & Logging

### Logging Strategy
- **Format**: JSON for easy parsing
- **Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Retention**: 30 days in CloudWatch
- **Transport**: Winston with CloudWatch integration

### Metrics & Alerts
- **CloudWatch**: API response time, error rate, pool utilization
- **Alarms**: Error >5%, Response >2sec p95, Connection pool >90%
- **Health Checks**: GET /health, /health/db, /health/s3

## Deployment

### Development
- Local Docker Compose (frontend, backend, PostgreSQL, Redis, MinIO)
- Hot reload enabled
- Mock S3 (MinIO) for document testing

### Production
- **Architecture**: CloudFlare → ALB → ECS Fargate → RDS PostgreSQL + S3
- **CI/CD**: GitHub Actions (test, build, push to ECR, deploy to ECS)
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch + Sentry
- **Backups**: Daily automated, WAL-E or pg_dump

## Code Conventions

### Naming
- **Functions**: camelCase (getProvider, calculateScore)
- **Classes/Components**: PascalCase (Provider, Dashboard)
- **Constants**: UPPER_SNAKE_CASE (MAX_FILE_SIZE, JWT_EXPIRY)
- **Files**: kebab-case or PascalCase for classes

### Style Guidelines
- Use async/await, not callbacks
- Try/catch for error handling
- Optional chaining (?.) for null safety
- No console.log, use logger
- Comments for "why", not "what"
- Max 30-line functions, 500-line files

## Build Phases (6-8 weeks)

### Phase 1: Setup (Week 1)
- GitHub repo, branch protection, Docker setup
- Express + React initialization
- PostgreSQL schema, CI/CD pipeline

### Phase 2-3: Core Backend & Frontend (Weeks 2-3)
- Authentication, all CRUD endpoints
- Dashboard, provider directory, profile views
- Input validation, error handling, audit logging

### Phase 4: Alert System (Week 4)
- Expiration check job, alert creation
- Email integration, alert UI and configuration

### Phase 5: Document Management (Weeks 4-5)
- S3 integration, drag-drop upload
- File validation, versioning, delete functionality

### Phase 6: Reporting (Week 5)
- Compliance score calculation
- Report generators, CSV/Excel export
- Audit trail view

### Phase 7: Testing & Polish (Week 6)
- Unit, integration, component tests
- Error boundaries, performance optimization
- Security audit

### Phase 8: Deployment (Week 7)
- AWS infrastructure, SSL/TLS setup
- Monitoring, backups, disaster recovery
- Production deployment and monitoring

## Key Resources

- **Comprehensive Build Prompt**: CredVault_Comprehensive_Build_Prompt.md
- **API Documentation**: Generate with Swagger/OpenAPI
- **Database Diagram**: Entity relationship visualization
- **Component Library**: Tailwind + Headless UI components
- **Testing Fixtures**: Sample providers, credentials, documents

## Contact & Support

For questions about architecture, requirements, or implementation details, refer to the comprehensive build prompt for detailed specifications on any module.

---

**Last Updated**: 2024-01-15  
**Project Status**: Ready for Phase 1 (Setup) implementation  
**Team Size**: 2-3 developers  
**Estimated Timeline**: 6-8 weeks to MVP
