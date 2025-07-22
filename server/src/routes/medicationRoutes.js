const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/due', protect, authorize('nurse', 'admin'), medicationController.getDueMedications);

router.get('/administered/count', protect, authorize('nurse', 'admin'), medicationController.getAdministeredMedicationsCount);

router.put('/:medicationId/administer', protect, authorize('nurse', 'admin'), medicationController.markMedicationAsAdministered);

module.exports = router;