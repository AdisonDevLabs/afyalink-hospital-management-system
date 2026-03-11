import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getDoctorActivities } from '../controllers/activityController.js';

const router = express.Router();

router.get(
    '/doctor-activities',
    protect,
    authorize('doctor', 'admin', 'guest'),
    getDoctorActivities
);

export default router;