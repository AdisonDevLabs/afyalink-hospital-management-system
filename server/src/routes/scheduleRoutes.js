const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), scheduleController.getAllSchedules);

router.post('/', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.createAppointment);

router.put('/:id', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.updateAppointment);

router.delete('/:id', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.deleteAppointment);

router.post('/availability', conditionallyProtect, authorize('admin', 'doctor'), scheduleController.createDoctorAvailability);

router.get('/availability', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), scheduleController.getDoctorAvailabilities);

router.put('/availability/:id', conditionallyProtect, authorize('admin', 'doctor'), scheduleController.updateDoctorAvailability);

router.delete('/availability/:id', conditionallyProtect, authorize('admin', 'doctor'), scheduleController.deleteDoctorAvailability);

module.exports = router;