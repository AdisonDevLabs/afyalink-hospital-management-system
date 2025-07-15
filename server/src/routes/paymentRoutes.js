// backend/src/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Assuming you have these

// Route to get today's total revenue
// Typically accessible by receptionists, admins, and finance roles
router.get(
  '/payments/revenue/today',
  protect,
  authorize('receptionist', 'admin', 'finance'), // Adjust roles as needed
  paymentController.getTodayRevenue
);

// Route to get the count of pending payments
// Typically accessible by receptionists, admins, and finance roles
router.get(
  '/payments/pending/count',
  protect,
  authorize('receptionist', 'admin', 'finance'), // Adjust roles as needed
  paymentController.getPendingPaymentsCount
);

module.exports = router;