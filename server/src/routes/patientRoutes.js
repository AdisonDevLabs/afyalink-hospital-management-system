// backend/src/routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All patients will be protected and require specific roles

// Create Patient
router.post('/', protect, authorize('admin', 'receptionist'), patientController.createPatient);

// Get All patients (authenticated) - This route handles filters like nurse_id and assigned_today
router.get('/', protect, patientController.getAllPatients);

// Define the count route first to avoid conflicts with :id
router.get('/count', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), patientController.getPatientCount);

// Get recent patient registrations (NEW ROUTE)
router.get('/recent', protect, authorize('admin', 'receptionist', 'doctor', 'nurse'), patientController.getRecentPatients);

// Get patients by ID (authenticated)
router.get('/:id', protect, patientController.getPatientById);

// Update patient
router.put('/:id', protect, authorize('admin', 'receptionist'), patientController.updatePatient);

// Delete patient (admin only)
router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

module.exports = router;