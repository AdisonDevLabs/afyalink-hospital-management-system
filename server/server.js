require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5007;

const pool = require('./src/config/db');
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
const { restrictInDemo } = require('./src/middleware/demoMode');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(restrictInDemo)

app.get('/', (req, res) => {
  res.status(200).json({ message: 'AfyaLink HMS Backend is Running' });
});

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical-notes', clinicalNoteRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/lab-reports', labReportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api', activityRoutes);
app.use('/api', paymentRoutes);
app.use('/api/orders', orderRoutes);

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