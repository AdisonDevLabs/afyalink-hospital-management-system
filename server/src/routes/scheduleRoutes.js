const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), scheduleController.getAllSchedules);

router.post('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.createAppointment);

router.put('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.updateAppointment);

router.delete('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), scheduleController.deleteAppointment);

router.post('/availability', protect, authorize('admin', 'doctor'), scheduleController.createDoctorAvailability);

router.get('/availability', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), scheduleController.getDoctorAvailabilities);

router.put('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.updateDoctorAvailability);

router.delete('/availability/:id', protect, authorize('admin', 'doctor'), scheduleController.deleteDoctorAvailability);

module.exports = router;