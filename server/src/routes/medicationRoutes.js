// backend/src/routes/medicationRoutes.js

const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get medications due for a specific nurse
// This route handles GET /api/medications/ (which becomes /api/medications/due when query param is added)
router.get('/due', protect, authorize('nurse', 'admin'), medicationController.getDueMedications);

// Get count of medications administered by a specific nurse today
router.get(
  '/administered/count',
  protect,
  authorize('nurse', 'admin'),
  medicationController.getAdministeredMedicationsCount
);

// Mark a medication as administered
router.put(
  '/:medicationId/administer',
  protect,
  authorize('nurse', 'admin'),
  medicationController.markMedicationAsAdministered
);

module.exports = router;