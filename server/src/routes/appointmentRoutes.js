const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All appointment routes will be protected and require specific roles

// Create appointment
router.post('/', protect, authorize('admin', 'receptionist'), appointmentController.createAppointment);

// Get all appointments (filtered by patient_id, doctor_id, dat, status)
// Accessible by all authorised users (admin, doctor, nurse, receptionist)
router.get('/', protect, appointmentController.getAllAppointments);

// Get appointment by ID (accessible by all authenticated users)
router.get('/:id', protect, appointmentController.getAppointmentById);

// Update appointment (Receptionist, Admin, Doctor - doctor can update status/reason for their own appointment)
router.put('/:id', protect, authorize('admin', 'receptionist', 'doctor'), appointmentController.updateAppointment);

// Delete appointment (admin only)
router.delete('/:id', protect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
