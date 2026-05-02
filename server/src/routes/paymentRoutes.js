import express from 'express';
const router = express.Router();
import { getTodayRevenue, getPendingPaymentsCount } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get(
  '/payments/revenue/today',
  protect,
  authorize('receptionist', 'admin', 'finance', 'guest'),
  getTodayRevenue
);

router.get(
  '/payments/pending/count',
  protect,
  authorize('receptionist', 'admin', 'finance', 'guest'),
  getPendingPaymentsCount
);

export default router;