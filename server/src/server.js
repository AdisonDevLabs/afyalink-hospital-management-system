// src/server/js

require('dotenv').config();

const http = require('http');
const WebSocket = require('ws');
const app = require('./app');

const PORT = process.env.PORT || 5006;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log(`WebSocket connected from ${req.socket.remoteAddress}`);
  ws.send(JSON.stringify({ type: 'status', message: 'Secure connection established.' }));

  const interval = setInterval(() => {

    const payload = {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(payload));

    const availableBeds = Math.floor(Math.random() * 20) + 5;
    const totalBeds = 50;
    const newAlerts = [
      { id: Date.now(), message: `New critical event detected! Bed ${Math.floor(Math.random() * totalBeds) + 1} status changed.`, type: 'critical', timestamp: new Date().toISOString() },
    ];
    ws.send(JSON.stringify({ type: 'bed_update', availableBeds, totalBeds }));
    if (Math.random() > 0.7) {
        ws.send(JSON.stringify({ type: 'new_alert', alert: newAlerts[0] }));
    }
  }, 5000);

  ws.on('message', (message) => {
    console.log(`WS message: ${message}`);
  });

  ws.on('close', () => {
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`HTTP  → http://localhost:${PORT}`);
  console.log(`WS    → ws://localhost:${PORT}`);
});

// Graceful Shutdown
function gracefulShutdown() {
  console.log('\nInitializing graceful shutdown...');

  wss.close(() => {
    console.log('WebSocket closed.');
  });

  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

// Listening for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});