const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('nurse', 'doctor', 'admin', 'guest'), alertController.getAlertsByRecipientRole);

router.get('/by-user', protect, authorize('nurse', 'doctor', 'admin'), alertController.getAlerts);

module.exports = router;