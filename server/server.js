// server/server.js

require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5007;

// --- Security Middleware ---
const { protect } = require('./src/middleware/authMiddleware');
const { restrictInDemo } = require('./src/middleware/demoMode');

const pool = require('./src/config/db');

// -- Routes Imports ---
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const labReportRoutes = require('./src/routes/labReportRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const medicationRoutes = require('./src/routes/medicationRoutes');
const vitalRoutes = require('./src/routes/vitalRoutes');
const bedRoutes = require('./src/routes/bedRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

// --- Configuration and General Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5005',
  credentials: true // ESSENTIAL for sending/receiving cookies (JWTs)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies and populates req.cookies

// --- Static Files Setup ---
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
};
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// --- Root Route ---
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AfyaLink HMS Backend is Running' });
});

// ---------------------------------------------------
// --- Centralized API Router and Security Chain ---
// ---------------------------------------------------

const apiRouter = express.Router();

// --- PUBLIC ROUTES ---
apiRouter.use('/auth', authRoutes);

// -- GLOBAL SECURITY MIDDLEWARE
// All routes below require a valid token and will have re.user set
apiRouter.use(protect);
apiRouter.use(restrictInDemo);

// --- PROTECTED ROUTES
apiRouter.use('/users', userRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/clinical-notes', clinicalNoteRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/schedules', scheduleRoutes);
apiRouter.use('/lab-reports', labReportRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/medications', medicationRoutes);
apiRouter.use('/vitals', vitalRoutes);
apiRouter.use('/beds', bedRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('', activityRoutes);
apiRouter.use('', paymentRoutes);
apiRouter.use('/orders', orderRoutes);

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).send({
    message: 'An unexpected error occured.',
    error: err.message
  });
});

// --- Server and WebSocket Setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket.');
  ws.send(JSON.stringify({ type: 'status', message: 'Welcome to the live data stream!' }));

  const interval = setInterval(() => {
    const availableBeds = Math.floor(Math.random() * 20) + 5;
    const totalBeds = 50;
    const newAlerts = [
      { id: Date.now(), message: `New critical event detected! Bed ${Math.floor(Math.random() * totalBeds) + 1} status changed.`, type: 'critical', timestamp: new Date().toISOString() },
    ];
    ws.send(JSON.stringify({ type: 'bed_update', availableBeds, totalBeds }));
    if (Math.random() > 0.7) {
        ws.send(JSON.stringify({ type: 'new_alert', alert: newAlerts[0] }));
    }
  }, 3000);

  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket.');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error occurred:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend API at: http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});