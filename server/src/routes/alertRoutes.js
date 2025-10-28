const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/', conditionallyProtect, authorize('nurse', 'doctor', 'admin', 'guest_demo'), alertController.getAlertsByRecipientRole);

router.get('/by-user', conditionallyProtect, authorize('nurse', 'doctor', 'admin', 'guest_demo'), alertController.getAlerts);

module.exports = router;