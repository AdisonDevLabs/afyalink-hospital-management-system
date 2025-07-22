const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/payments/revenue/today',
  protect,
  authorize('receptionist', 'admin', 'finance'),
  paymentController.getTodayRevenue
);

router.get(
  '/payments/pending/count',
  protect,
  authorize('receptionist', 'admin', 'finance'),
  paymentController.getPendingPaymentsCount
);

module.exports = router;