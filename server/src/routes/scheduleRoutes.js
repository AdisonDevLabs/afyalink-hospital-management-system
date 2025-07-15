// backend/src/routes/scheduleRoutes.js

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Existing route for GET /api/schedules
// @route GET /api/schedules
// @desc Get all general schedules/events from appointments
// @access Private (Admin, Doctor, Receptionist, Nurse)
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.getAllSchedules);


// ⭐ NEW: @route POST /api/schedules
// ⭐ NEW: @desc Create a new general schedule/appointment
// ⭐ NEW: @access Private (Admin, Doctor, Receptionist, Nurse)
router.post('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.createAppointment);

// ⭐ NEW: @route PUT /api/schedules/:id
// ⭐ NEW: @desc Update a general schedule/appointment by ID
// ⭐ NEW: @access Private (Admin, Doctor, Receptionist, Nurse)
router.put('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.updateAppointment);


// ⭐ NEW: @route DELETE /api/schedules/:id
// ⭐ NEW: @desc Delete a general schedule/appointment by ID
// ⭐ NEW: @access Private (Admin, Doctor, Receptionist, Nurse)
router.delete('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.deleteAppointment);


// Existing routes for doctor availability
// @route   POST /api/schedules/availability
// @desc    Create new doctor availability (recurring schedule)
// @access  Private (Admin, Doctor)
router.post('/availability', protect, authorize('admin', 'doctor'), scheduleController.createDoctorAvailability);

// @route   GET /api/schedules/availability
// @desc    Get all doctor availabilities (optional: filter by doctor_id)
// @access  Private (Admin, Doctor, Receptionist, Nurse)
router.get('/availability', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.getDoctorAvailabilities);

// @route   PUT /api/schedules/availability/:id
// @desc    Update doctor availability by ID
// @access  Private (Admin, Doctor)
router.put('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.updateDoctorAvailability);

// @route   DELETE /api/schedules/availability/:id
// @desc    Delete doctor availability by ID
// @access  Private (Admin, Doctor)
router.delete('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.deleteDoctorAvailability);

module.exports = router;