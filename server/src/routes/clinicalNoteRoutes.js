import express from 'express';
const router = express.Router();
import { createClinicalNote, getClinicalNotesByPatient, getClinicalNoteById, updateClinicalNote, deleteClinicalNote } from '../controllers/clinicalNoteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/', protect, authorize('admin', 'doctor', 'nurse'), createClinicalNote);

router.get('/patient/:patientId', protect, authorize('admin', 'doctor', 'nurse', 'guest'), getClinicalNotesByPatient);

router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'guest'), getClinicalNoteById);

router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), updateClinicalNote);

router.delete('/:id', protect, authorize('admin', 'doctor'), deleteClinicalNote);

export default router;