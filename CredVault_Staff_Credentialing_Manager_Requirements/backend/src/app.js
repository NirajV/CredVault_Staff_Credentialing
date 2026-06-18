import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import credentialRoutes from './routes/credentials.js';
import alertRoutes from './routes/alerts.js';
import reportRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import { authenticate } from './middleware/authenticate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

let db = null;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Public routes
app.use('/api/v1/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/v1/providers',   authenticate, providerRoutes);
app.use('/api/v1/credentials', authenticate, credentialRoutes);
app.use('/api/v1/alerts',      authenticate, alertRoutes);
app.use('/api/v1/reports',     authenticate, reportRoutes);
app.use('/api/v1/dashboard',   authenticate, dashboardRoutes);

app.use('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'CredVault API v1.0.0',
    endpoints: {
      health: '/health',
      providers: '/providers',
      auth: '/auth/*',
      dashboard: '/dashboard/*',
      alerts: '/alerts/*',
      reports: '/reports/*'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error',
      statusCode: err.statusCode || 500
    }
  });
});

// Start server with database initialization
const startServer = async () => {
  try {
    db = await initDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`✨ CredVault Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`📋 Providers API: http://localhost:${PORT}/api/v1/providers`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
