import express from 'express';
const router = express.Router();
import { getVitalsNeedingUpdate, getRecordedVitalsCount } from '../controllers/vitalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/needs-update', protect, authorize('nurse', 'admin', 'guest'), getVitalsNeedingUpdate);

router.get(
  '/recorded/count',
  protect,
  authorize('nurse', 'admin'),
  getRecordedVitalsCount
);

export default router;