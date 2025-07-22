const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/availability', protect, authorize('nurse', 'doctor', 'admin', 'receptionist'), bedController.getBedOccupancy);

module.exports = router;