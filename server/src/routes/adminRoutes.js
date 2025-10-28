const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/stats', conditionallyProtect, authorize('admin', 'receptionist', 'guest_demo'), adminController.getAdminStats);

router.get('/appointment-status-counts', conditionallyProtect, authorize('admin', 'guest_demo'), adminController.getAppointmentStatusCounts);

module.exports = router;