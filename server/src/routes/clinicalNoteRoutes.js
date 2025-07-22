const express = require('express');
const router = express.Router();
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.createClinicalNote);

router.get('/patient/:patientId', protect, authorize('admin', 'doctor', 'nurse', 'guest'), clinicalNoteController.getClinicalNotesByPatient);

router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'guest'), clinicalNoteController.getClinicalNoteById);

router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.updateClinicalNote);

router.delete('/:id', protect, authorize('admin', 'doctor'), clinicalNoteController.deleteClinicalNote);

module.exports = router;