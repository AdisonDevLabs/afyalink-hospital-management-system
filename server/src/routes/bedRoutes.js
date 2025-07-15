// backend/src/routes/bedRoutes.js

const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get bed occupancy status
// Accessible by nurses, doctors, and administrators
router.get('/availability', protect, authorize('nurse', 'doctor', 'admin', 'receptionist'), bedController.getBedOccupancy); // Changed from '/occupancy' to '/availability'

module.exports = router;