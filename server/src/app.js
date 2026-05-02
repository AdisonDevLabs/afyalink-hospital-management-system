// server/src/app.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import hpp from 'hpp';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import pool from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import clinicalNoteRoutes from './routes/clinicalNoteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import labReportRoutes from './routes/labReportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import vitalRoutes from './routes/vitalRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

const app = express();
const API_VERSION = '/api/v1';

app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware Configuration  ---

// Security
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Cross-Origin Resource Sharing
const allowedOrigins = [
  "https://afyalink-hms.onrender.com",
  "http://localhost:5005",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error(`CORS blocked: ${origin} not allowed.`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate Limiting: Limits requests to prevent brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(API_VERSION, apiLimiter);

// Prevent HTTP parameter polution
app.use(hpp());
// Data Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


// Response Compression
app.use(compression());

// Request logging and audit trails
if (env.NODE_ENV !== 'test') app.use(morgan('combined'));

// --- Static and Uploads Setup ---
// Creates the uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
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
app.use(`${API_VERSION}/auth`, authRoutes);
app.use(`${API_VERSION}/staff`, userRoutes);
app.use(`${API_VERSION}/patients`, patientRoutes);
app.use(`${API_VERSION}/appointments`, appointmentRoutes);
app.use(`${API_VERSION}/clinical-notes`, clinicalNoteRoutes);
app.use(`${API_VERSION}/departments`, departmentRoutes);
app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/schedules`, scheduleRoutes);
app.use(`${API_VERSION}/lab-reports`, labReportRoutes);
app.use(`${API_VERSION}/messages`, messageRoutes);
app.use(`${API_VERSION}/medications`, medicationRoutes);
app.use(`${API_VERSION}/vitals`, vitalRoutes);
app.use(`${API_VERSION}/beds`, bedRoutes);
app.use(`${API_VERSION}/alerts`, alertRoutes);
app.use(`${API_VERSION}`, activityRoutes);
app.use(`${API_VERSION}`, paymentRoutes);
app.use(`${API_VERSION}/orders`, orderRoutes);

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
    error: env.NODE_ENV === 'development' ? err : {},
  });
});

export default app;