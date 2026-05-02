import express from 'express';
const router = express.Router();
import { getAlertsByRecipientRole, getAlerts } from '../controllers/alertController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/', protect, authorize('nurse', 'doctor', 'admin', 'guest'), getAlertsByRecipientRole);

router.get('/by-user', protect, authorize('nurse', 'doctor', 'admin', 'guest'), getAlerts);

export default router;