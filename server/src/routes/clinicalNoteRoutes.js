const express = require('express');
const router = express.Router();
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.post('/', conditionallyProtect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.createClinicalNote);

router.get('/patient/:patientId', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'guest_demo'), clinicalNoteController.getClinicalNotesByPatient);

router.get('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'guest_demo'), clinicalNoteController.getClinicalNoteById);

router.put('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.updateClinicalNote);

router.delete('/:id', conditionallyProtect, authorize('admin', 'doctor'), clinicalNoteController.deleteClinicalNote);

module.exports = router;