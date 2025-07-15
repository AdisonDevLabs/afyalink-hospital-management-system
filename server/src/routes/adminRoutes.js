// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware'); // <--- Use these destructured functions

// Get admin dashboard statistics (Admin only)
router.get('/stats', protect, authorize('admin', 'receptionist'), adminController.getAdminStats);

// ⭐ CORRECTED LINE: Use protect and authorize middleware ⭐
router.get('/appointment-status-counts', protect, authorize('admin'), adminController.getAppointmentStatusCounts);

module.exports = router;