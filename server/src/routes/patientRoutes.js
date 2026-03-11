import express from 'express';
const router = express.Router();
import { createPatient, getAllPatients, getPatientCount, getRecentPatients, getPatientById, updatePatient, deletePatient } from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/', protect, authorize('admin', 'receptionist'), createPatient);

router.get('/', protect, getAllPatients);

router.get('/count', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest'), getPatientCount);

router.get('/recent', protect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest'), getRecentPatients);

router.get('/:id', protect, getPatientById);

router.put('/:id', protect, authorize('admin', 'receptionist'), updatePatient);

router.delete('/:id', protect, authorize('admin'), deletePatient);

export default router;