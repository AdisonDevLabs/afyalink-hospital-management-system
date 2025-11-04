const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

const router = express.Router();

router.get(
    '/doctor-activities',
    protect,
    authorize('doctor', 'admin', 'guest'),
    activityController.getDoctorActivities
);

module.exports = router;