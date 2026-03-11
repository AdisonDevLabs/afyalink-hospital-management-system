import express from 'express';
const router = express.Router();
import { getAdminStats, getAppointmentStatusCounts } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/stats', protect, authorize('admin', 'receptionist'), getAdminStats);

router.get('/appointment-status-counts', protect, authorize('admin'), getAppointmentStatusCounts);

export default router;