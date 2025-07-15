// backend/src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get new doctor orders for a specific nurse
// THIS IS THE ROUTE DEFINITION FOR /new
router.get(
  '/new',
  protect,
  authorize('nurse', 'admin'),
  orderController.getNewDoctorOrders
);

// You might add other order-related routes here later, e.g.:
// router.post('/', protect, authorize('doctor', 'admin'), orderController.createOrder);
// router.put('/:orderId/status', protect, authorize('nurse', 'admin'), orderController.updateOrderStatus);

module.exports = router;