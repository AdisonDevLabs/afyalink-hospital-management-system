const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'receptionist'), patientController.createPatient);

router.get('/', protect, patientController.getAllPatients);

router.get('/count', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest'), patientController.getPatientCount);

router.get('/recent', protect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest'), patientController.getRecentPatients);

router.get('/:id', protect, patientController.getPatientById);

router.put('/:id', protect, authorize('admin', 'receptionist'), patientController.updatePatient);

router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

module.exports = router;