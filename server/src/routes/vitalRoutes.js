// backend/src/routes/vitalRoutes.js

const express = require('express');
const router = express.Router();
const vitalController = require('../controllers/vitalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get vitals needing update for a specific nurse
// THIS IS THE CHANGE: Now explicitly handles /needs-update
router.get('/needs-update', protect, authorize('nurse', 'admin'), vitalController.getVitalsNeedingUpdate);

router.get(
  '/recorded/count',
  protect,
  authorize('nurse', 'admin'),
  vitalController.getRecordedVitalsCount
);

// You might also have other vital-related routes here, for example:
// router.get('/recorded/count', protect, authorize('nurse', 'admin'), vitalController.getRecordedVitalsCount);
// router.post('/', protect, authorize('nurse', 'admin'), vitalController.recordNewVital);
// router.put('/:id', protect, authorize('nurse', 'admin'), vitalController.updateVital);

module.exports = router;