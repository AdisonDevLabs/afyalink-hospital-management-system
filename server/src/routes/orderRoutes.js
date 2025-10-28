const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get(
  '/new',
  conditionallyProtect,
  authorize('nurse', 'admin', 'guest_demo'),
  orderController.getNewDoctorOrders
);

module.exports = router;