const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const notFoundHandler = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const ApiResponse = require('./utils/ApiResponse');

const app = express();

// Trust reverse proxy (important for Render, Vercel, Heroku to obtain real client IP for rate limiting)
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Controlled CORS Configuration
const allowedOrigins = env.FRONTEND_URLS;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development, allow any localhost / 127.0.0.1 origin
    if (env.NODE_ENV === 'development') {
      if (/^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    // Check against allowed whitelist
    const isAllowed = allowedOrigins.some(allowed => {
      const cleanAllowed = allowed.toLowerCase().replace(/\/$/, '');
      const cleanOrigin = origin.toLowerCase().replace(/\/$/, '');
      return cleanOrigin === cleanAllowed || cleanOrigin.endsWith('.vercel.app');
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply global rate limiting to API routes
app.use('/api/v1', apiLimiter);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';

  const healthData = {
    status: 'ok',
    service: 'Ayush Creation B2B Manufacturing API',
    environment: env.NODE_ENV,
    uptime: `${Math.floor(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      isConnected: dbState === 1
    },
    version: '1.0.0'
  };

  res.status(200).json(new ApiResponse(200, healthData, 'Ayush Creation API is healthy and operational'));
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    service: 'Ayush Creation Production Backend',
    documentation: '/api/v1/health',
    version: '1.0.0',
    company: 'Ayush Creation — Garment Manufacturers, Mumbai / Navi Mumbai'
  });
});

// Register API Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/enquiries', enquiryRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin/upload', uploadRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);

// Direct admin path aliases for Section 14 routes
app.use('/api/v1/admin/categories', categoryRoutes);
app.use('/api/v1/admin/products', productRoutes);
app.use('/api/v1/admin/enquiries', enquiryRoutes);
app.use('/api/v1/admin/gallery', galleryRoutes);
app.use('/api/v1/admin/settings', settingsRoutes);
// app.use('/api/v1/categories', categoryRoutes);
// app.use('/api/v1/enquiries', enquiryRoutes);
// app.use('/api/v1/gallery', galleryRoutes);
// app.use('/api/v1/settings', settingsRoutes);
// app.use('/api/v1/admin/dashboard', dashboardRoutes);

// Error Handling Middlewares (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
