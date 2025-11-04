// server/src/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const pool = require('./config/db');

// Route Imports
const authRoutes = require('./routes/authRoutes');const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const clinicalNoteRoutes = require('./routes/clinicalNoteRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const labReportRoutes = require('./routes/labReportRoutes');
const messageRoutes = require('./routes/messageRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const vitalRoutes = require('./routes/vitalRoutes');
const bedRoutes = require('./routes/bedRoutes');
const alertRoutes = require('./routes/alertRoutes');
const activityRoutes = require('./routes/activityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const API_V1 = '/api/v1';

// --- Middleware Configuration  ---

// Security
app.use(helmet());

// Rate Limiting: Limits requests to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(API_V1, apiLimiter);

// Data Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cross-Origin Resource Sharing
app.use(cors());

// Response Compression
app.use(compression());

// --- Static and Uploads Setup ---
// Creates the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serves static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// --- Health Check ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Afyalink HMS Backend is running' });
});

// --- API Routes ---
app.use(`${API_V1}/auth`, authRoutes);
app.use(`${API_V1}/users`, userRoutes);
app.use(`${API_V1}/patients`, patientRoutes);
app.use(`${API_V1}/appointments`, appointmentRoutes);
app.use(`${API_V1}/clinical-notes`, clinicalNoteRoutes);
app.use(`${API_V1}/departments`, departmentRoutes);
app.use(`${API_V1}/admin`, adminRoutes);
app.use(`${API_V1}/schedules`, scheduleRoutes);
app.use(`${API_V1}/lab-reports`, labReportRoutes);
app.use(`${API_V1}/messages`, messageRoutes);
app.use(`${API_V1}/medications`, medicationRoutes);
app.use(`${API_V1}/vitals`, vitalRoutes);
app.use(`${API_V1}/beds`, bedRoutes);
app.use(`${API_V1}/alerts`, alertRoutes);
app.use(`${API_V1}`, activityRoutes);
app.use(`${API_V1}`, paymentRoutes);
app.use(`${API_V1}/orders`, orderRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'developemnt' ? err: {},
  });
});

module.exports = app;