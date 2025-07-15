// server.js
require('dotenv').config();

const express = require('express');
const http = require('http'); // Import http module for WebSocket server
const WebSocket = require('ws'); // Import WebSocket library
const cors = require('cors'); // Import cors middleware for cross-origin requests

const app = express();
const PORT = process.env.PORT || 5000; // Backend server will listen on 5005

// Import database pool
const pool = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const labReportRoutes = require('./src/routes/labReportRoutes'); // ⭐ NEW: Import labReportRoutes
const messageRoutes = require('./src/routes/messageRoutes'); // ⭐ NEW: Import messageRoutes
const medicationRoutes = require('./src/routes/medicationRoutes'); // NEW
const vitalRoutes = require('./src/routes/vitalRoutes');           // NEW
const bedRoutes = require('./src/routes/bedRoutes');               // NEW
const alertRoutes = require('./src/routes/alertRoutes');           // NEW
const activityRoutes = require('./src/routes/activityRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Basic root route for testing API status
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AfyaLink HMS Backend is Running' });
});

// Mount your API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical-notes', clinicalNoteRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/lab-reports', labReportRoutes); // ⭐ NEW: Mount labReportRoutes
app.use('/api/messages', messageRoutes);     // ⭐ NEW: Mount messageRoutes
app.use('/api/medications', medicationRoutes); // NEW
app.use('/api/vitals', vitalRoutes);    // NEW
app.use('/api/beds', bedRoutes);    // NEW
app.use('/api/alerts', alertRoutes);  // NEW
app.use('/api', activityRoutes);
app.use('/api', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Create HTTP server for Express and WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket.');
  ws.send(JSON.stringify({ type: 'status', message: 'Welcome to the live data stream!' }));

  // Example: Send dummy live data every 3 seconds
  const interval = setInterval(() => {
    const availableBeds = Math.floor(Math.random() * 20) + 5; // Random number between 5 and 24
    const totalBeds = 50;
    const newAlerts = [
      { id: Date.now(), message: `New critical event detected! Bed ${Math.floor(Math.random() * totalBeds) + 1} status changed.`, type: 'critical', timestamp: new Date().toISOString() },
    ];
    ws.send(JSON.stringify({ type: 'bed_update', availableBeds, totalBeds }));
    if (Math.random() > 0.7) { // Send an alert occasionally
        ws.send(JSON.stringify({ type: 'new_alert', alert: newAlerts[0] }));
    }
  }, 3000);

  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
    // You can handle messages from the client here
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket.');
    clearInterval(interval); // Clear the interval when client disconnects
  });

  ws.on('error', (error) => {
    console.error('WebSocket error occurred:', error);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend API at: http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`); // Inform about WebSocket
});