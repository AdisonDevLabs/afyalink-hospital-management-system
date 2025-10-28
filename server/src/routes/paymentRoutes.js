const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get(
  '/payments/revenue/today',
  conditionallyProtect,
  authorize('receptionist', 'admin', 'finance', 'guest_mode'),
  paymentController.getTodayRevenue
);

router.get(
  '/payments/pending/count',
  conditionallyProtect,
  authorize('receptionist', 'admin', 'finance', 'guest_mode'),
  paymentController.getPendingPaymentsCount
);

module.exports = router;