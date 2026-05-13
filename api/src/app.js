const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes         = require('./modules/auth/auth.routes');
const citizenRoutes      = require('./modules/citizens/citizens.routes');
const applicationRoutes  = require('./modules/applications/applications.routes');
const documentRoutes     = require('./modules/documents/documents.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const agencyRoutes       = require('./modules/agencies/agencies.routes');
const idcardRoutes       = require('./modules/idcards/idcards.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', require('express').static('uploads'));

// All routes
app.use('/api/auth',          authRoutes);
app.use('/api/citizens',      citizenRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/documents',     documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/agencies',      agencyRoutes);
app.use('/api/idcards',       idcardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Mala-Link API is running',
    routes: [
      // Auth
      'POST   /api/auth/register',
      'POST   /api/auth/login',
      // Citizens
      'GET    /api/citizens/me',
      'PATCH  /api/citizens/me',
      // Applications
      'POST   /api/applications',
      'GET    /api/applications/my',
      'GET    /api/applications/:id',
      'GET    /api/applications/agency/all',
      'PATCH  /api/applications/:id/status',
      'GET    /api/applications',
      // Application Form
      'POST   /api/applications/:id/form',
      'GET    /api/applications/:id/form',
      'PATCH  /api/applications/:id/form/verify',
      // Documents
      'POST   /api/documents/upload/:applicationId',
      'GET    /api/documents/:applicationId',
      'DELETE /api/documents/:documentId',
      // Notifications
      'GET    /api/notifications/my',
      'PATCH  /api/notifications/:id/read',
      // Agencies
      'GET    /api/agencies',
      'POST   /api/agencies/staff',
      'POST   /api/agencies/staff/login',
      'GET    /api/agencies/:id/stats',
      // ID Cards
      'GET    /api/idcards/search',
      'POST   /api/idcards/manual',
      'GET    /api/idcards/my',
      'GET    /api/idcards/:id',
      'PATCH  /api/idcards/:cardNumber/status',
      'POST   /api/idcards/:applicationId/issue',
      'PATCH  /api/idcards/:applicationId/collect',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mala-Link API running on http://localhost:${PORT}/api`);
});