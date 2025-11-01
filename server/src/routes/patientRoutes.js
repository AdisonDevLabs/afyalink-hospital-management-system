const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST /api/patients
router.post('/', protect, authorize('admin', 'receptionist'), patientController.createPatient);

// GET /api/patients
router.get('/', protect, authorize('admin', 'receptionist', 'nurse', 'doctor', 'guest_demo'), patientController.getAllPatients);

// GET /api/patients/count
router.get('/count', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), patientController.getPatientCount);

// GET /api/patients/recent
router.get('/recent', protect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest_demo'), patientController.getRecentPatients);

// GET /api/patients/:id
router.get('/:id', protect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'guest_demo'), patientController.getPatientById);

// PUT /api/patients/:id
router.put('/:id', protect, authorize('admin', 'receptionist'), patientController.updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

module.exports = router;