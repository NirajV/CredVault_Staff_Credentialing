# CredVault - Healthcare Provider Credentialing Management System

A comprehensive healthcare provider credentialing and license management system for tracking, managing, verifying, and reporting on healthcare provider credentials.

## Features

- 🏥 **Provider Management** - Track 1000+ providers with detailed credential information
- 📋 **Credential Management** - Manage licenses, certifications, DEA registrations, and malpractice insurance
- 🔔 **Smart Alerts** - Automated expiration alerts (90/60/30/7 days)
- 📄 **Document Management** - Secure file uploads with versioning (up to 50MB)
- 📊 **Compliance Reporting** - Generate compliance and expiration reports
- 📈 **Compliance Scoring** - Automatic compliance score calculation (0-100)
- 🔒 **HIPAA Compliant** - Full encryption and audit trails
- 👥 **Role-Based Access** - Admin, Coordinator, Director, HR, Auditor roles

## Tech Stack

### Frontend
- React 18+ with Hooks
- Vite for fast builds
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation

### Backend
- Express.js 4.18+
- PostgreSQL 15
- JWT authentication
- Node-schedule for background jobs
- AWS S3 / MinIO for document storage

### Infrastructure
- Docker & Docker Compose
- PostgreSQL + Redis
- MinIO for local S3-compatible storage

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional, for containerized setup)
- PostgreSQL 15 (if not using Docker)

### Option 1: With Docker Compose (Recommended)

```bash
# Clone and navigate to project
cd CredVault_Staff_Credentialing_Manager_Requirements

# Start all services (PostgreSQL, Redis, MinIO, Frontend, Backend)
docker-compose up

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api/v1
# MinIO Console: http://localhost:9001 (minioadmin / minioadmin)
# PostgreSQL: localhost:5432
```

### Option 2: Local Development (Manual Setup)

#### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start the server (requires PostgreSQL on localhost:5432)
npm run dev

# Server runs on http://localhost:3001
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the dev server
npm run dev

# Frontend runs on http://localhost:5173
```

## Project Structure

```
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.jsx          # Main app component
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── app.js           # Express app setup
│   └── package.json
│
├── docker-compose.yml        # Docker services setup
└── CLAUDE.md                 # Project documentation
```

## API Documentation

### Base URL
```
Development: http://localhost:3001/api/v1
```

### Key Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

**Providers**
- `GET /providers` - List all providers
- `POST /providers` - Create new provider
- `GET /providers/:id` - Get provider details
- `PATCH /providers/:id` - Update provider
- `DELETE /providers/:id` - Delete provider

**Credentials**
- `GET /providers/:providerId/licenses` - List licenses
- `POST /providers/:providerId/licenses` - Create license
- `GET /providers/:providerId/certifications` - List certifications
- `GET /providers/:providerId/dea` - List DEA registrations
- `GET /providers/:providerId/malpractice` - List malpractice insurance

**Alerts & Reporting**
- `GET /alerts` - List alerts
- `GET /dashboard/summary` - Dashboard metrics
- `GET /reports/compliance-summary` - Compliance report
- `GET /reports/export-csv` - Export as CSV

See [CredVault_Comprehensive_Build_Prompt.md](./CredVault_Comprehensive_Build_Prompt.md) for complete API specifications.

## Development

### Environment Variables

**Backend (.env)**
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/credvault_db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=CredVault
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build
# Output: dist/

# Backend
cd backend
# Set NODE_ENV=production
npm start
```

## Database Schema

The system uses PostgreSQL with tables for:
- Users (authentication & roles)
- Providers (healthcare providers)
- Licenses, Certifications, DEA Registrations, Malpractice Insurance
- Privileges (facility-specific clinical privileges)
- Documents (uploaded credentials with versioning)
- Alerts (expiration and status alerts)
- Tasks (user-assigned work items)
- Audit Log (compliance audit trail)

See [CLAUDE.md](./CLAUDE.md) for complete schema documentation.

## Security

✅ **HIPAA Compliant**
- AES-256 encryption at rest
- TLS 1.2+ in transit
- Role-based access control
- Complete audit trail
- Secure password hashing (bcrypt)

✅ **Authentication**
- JWT with refresh tokens
- HTTPOnly secure cookies
- Rate limiting
- Password strength requirements

✅ **Data Protection**
- Encrypted SSN and DOB fields
- Encrypted S3 document storage
- File integrity verification (SHA-256)
- Automated daily backups

## Support

For detailed project documentation, see:
- [CLAUDE.md](./CLAUDE.md) - Project overview and architecture
- [CredVault_Comprehensive_Build_Prompt.md](./CredVault_Comprehensive_Build_Prompt.md) - Complete build specifications

## License

MIT License - See LICENSE file for details

## Status

🚀 **Development Phase 1** - Initial project setup and architecture  
Next: Phase 2 - Core backend and frontend development

---

**Last Updated**: June 2024  
**Version**: 1.0.0-alpha  
**Team**: CredVault Development Team
