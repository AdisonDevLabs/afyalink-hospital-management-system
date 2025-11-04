const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get(
  '/new',
  protect,
  authorize('nurse', 'admin'),
  orderController.getNewDoctorOrders
);

module.exports = router;