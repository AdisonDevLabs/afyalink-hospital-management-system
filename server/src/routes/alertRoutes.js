// backend/src/routes/alertRoutes.js

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get alerts for a specific recipient role
// Accessible by nurses, doctors, and administrators
router.get('/', protect, authorize('nurse', 'doctor', 'admin'), alertController.getAlertsByRecipientRole);

router.get('/by-user', protect, authorize('nurse', 'doctor', 'admin'), alertController.getAlerts);

module.exports = router;