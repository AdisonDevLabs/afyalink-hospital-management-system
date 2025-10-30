const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.post('/', conditionallyProtect, authorize('admin', 'receptionist'), appointmentController.createAppointment);

router.get('/', conditionallyProtect, authorize('admin','receptionist', 'doctor', 'nurse', 'guest_demo'), appointmentController.getAllAppointments);

router.get('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), appointmentController.getAppointmentById);

router.put('/:id', conditionallyProtect, authorize('admin', 'receptionist', 'doctor'), appointmentController.updateAppointment);

router.delete('/:id', conditionallyProtect, authorize('admin'), appointmentController.deleteAppointment);

module.exports = router;
