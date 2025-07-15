// src/routes/activityRoutes.js
const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController'); // You'll create this controller

const router = express.Router();

router.get(
    '/doctor-activities',
    protect,
    authorize('doctor', 'admin'), // Adjust roles as needed
    activityController.getDoctorActivities // You'll create this function
);

module.exports = router;