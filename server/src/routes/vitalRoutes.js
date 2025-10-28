const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/needs-update', conditionallyProtect, authorize('nurse', 'admin', 'guest_demo'), vitalController.getVitalsNeedingUpdate);

router.get(
  '/recorded/count',
  protect,
  authorize('nurse', 'admin', 'guest_demo'),
  vitalController.getRecordedVitalsCount
);

module.exports = router;