import express from 'express';
const router = express.Router();
import { getNewDoctorOrders } from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get(
  '/new',
  protect,
  authorize('nurse', 'admin', 'guest'),
  getNewDoctorOrders
);

export default router;