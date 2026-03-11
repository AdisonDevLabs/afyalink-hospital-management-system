import express from 'express';
const router = express.Router();
import { getTodayRevenue, getPendingPaymentsCount } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get(
  '/payments/revenue/today',
  protect,
  authorize('receptionist', 'admin', 'finance'),
  getTodayRevenue
);

router.get(
  '/payments/pending/count',
  protect,
  authorize('receptionist', 'admin', 'finance'),
  getPendingPaymentsCount
);

export default router;