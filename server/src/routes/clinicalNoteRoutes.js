// server/src/routes/clinicalNoteRoutes.js

const express = require('express');
const router = express.Router();
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/clinical-notes
router.post('/', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.createClinicalNote);

// GET /api/clinical-notes/patient/:patientId
router.get('/patient/:patientId', protect, authorize('admin', 'doctor', 'nurse', 'guest_demo'), clinicalNoteController.getClinicalNotesByPatient);

// GET /api/clinical-notes/:id
router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'guest_demo'), clinicalNoteController.getClinicalNoteById);

// PUT /api/clinical-notes/:id
router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.updateClinicalNote);

// DELETE /api/clinical-notes/:id
router.delete('/:id', protect, authorize('admin', 'doctor'), clinicalNoteController.deleteClinicalNote);

module.exports = router;