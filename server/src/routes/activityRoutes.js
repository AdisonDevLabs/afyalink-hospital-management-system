const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

const router = express.Router();

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get(
    '/doctor-activities',
    conditionallyProtect,
    authorize('doctor', 'admin', 'guest_demo'),
    activityController.getDoctorActivities
);

module.exports = router;