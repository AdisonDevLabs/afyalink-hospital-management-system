const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/due', conditionallyProtect, authorize('nurse', 'admin', 'guest_demo'), medicationController.getDueMedications);

router.get('/administered/count', conditionallyProtect, authorize('nurse', 'admin', 'guest_demo'), medicationController.getAdministeredMedicationsCount);

router.put('/:medicationId/administer', conditionallyProtect, authorize('nurse', 'admin'), medicationController.markMedicationAsAdministered);

module.exports = router;