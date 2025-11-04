const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'receptionist'), appointmentController.createAppointment);

router.get('/', protect, appointmentController.getAllAppointments);

router.get('/:id', protect, appointmentController.getAppointmentById);

router.put('/:id', protect, authorize('admin', 'receptionist', 'doctor'), appointmentController.updateAppointment);

router.delete('/:id', protect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
