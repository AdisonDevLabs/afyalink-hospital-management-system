const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/needs-update', protect, authorize('nurse', 'admin'), vitalController.getVitalsNeedingUpdate);

router.get(
  '/recorded/count',
  protect,
  authorize('nurse', 'admin'),
  vitalController.getRecordedVitalsCount
);

module.exports = router;