const express = require('express');
const router = express.Router();
const bedController = require('../controllers/bedController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/availability', conditionallyProtect, authorize('nurse', 'doctor', 'admin', 'receptionist', 'guest_demo'), bedController.getBedOccupancy);

module.exports = router;