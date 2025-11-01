// server/src/routes/scheduleRoutes.js

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Appointment Routes ---

// GET /api/schedules
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), scheduleController.getAllSchedules);

// POST /api/schedules
router.post('/', protect, authorize('admin', 'doctor', 'receptionist'), scheduleController.createAppointment);

// GET /api/schedules/:id
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), scheduleController.getAppointmentById);

// PUT /api/schedules/:id
router.put('/:id', protect, authorize('admin', 'doctor'), scheduleController.updateAppointment);

// DELETE /api/schedules/:id
router.delete('/:id', protect, authorize('admin', 'doctor'), scheduleController.deleteAppointment);

// --- Doctor Availability Routes ---

//POST /api/schedules/availability
router.post('/availability', protect, authorize('admin', 'doctor'), scheduleController.createDoctorAvailability);

// GET /api/schedules/availability
router.get('/availability', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), scheduleController.getDoctorAvailabilities);

// PUT /api/schedules/availability/:id
router.put('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.updateDoctorAvailability);

// DELETE /api/schedules/availability/:id
router.delete('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.deleteDoctorAvailability);

module.exports = router;