const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorize('admin', 'receptionist'), adminController.getAdminStats);

router.get('/appointment-status-counts', protect, authorize('admin'), adminController.getAppointmentStatusCounts);

module.exports = router;