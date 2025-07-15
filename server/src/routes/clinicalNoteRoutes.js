// clinicalNoteRoutes.js
const express = require('express');
const router = express.Router();
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create clinical note (requires 'admin', 'doctor', or 'nurse' - nurse restricted to 'Progress Note' in controller)
router.post('/', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.createClinicalNote);

// Get all clinical notes for a patient (requires authentication, accessible to admin, doctor, nurse)
router.get('/patient/:patientId', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.getClinicalNotesByPatient);

// Get single clinical note by ID (accessible to admin, doctor, nurse)
router.get('/:id', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.getClinicalNoteById);

// Update clinical note (requires 'admin', 'doctor', or 'nurse' - nurse restricted to own 'Progress Note' in controller)
router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.updateClinicalNote);

// Delete clinical note (requires admin or original doctor role - no change for nurse)
router.delete('/:id', protect, authorize('admin', 'doctor'), clinicalNoteController.deleteClinicalNote);

module.exports = router;