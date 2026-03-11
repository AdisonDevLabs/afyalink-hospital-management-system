import express from 'express';
const router = express.Router();
import { getDueMedications, getAdministeredMedicationsCount, markMedicationAsAdministered } from '../controllers/medicationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/due', protect, authorize('nurse', 'admin'), getDueMedications);

router.get('/administered/count', protect, authorize('nurse', 'admin'), getAdministeredMedicationsCount);

router.put('/:medicationId/administer', protect, authorize('nurse', 'admin'), markMedicationAsAdministered);

export default router;