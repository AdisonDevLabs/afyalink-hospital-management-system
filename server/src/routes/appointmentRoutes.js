import express from 'express';
const router = express.Router();
import { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/', protect, authorize('admin', 'receptionist'), createAppointment);

router.get('/', protect, getAllAppointments);

router.get('/:id', protect, getAppointmentById);

router.put('/:id', protect, authorize('admin', 'receptionist', 'doctor'), updateAppointment);

router.delete('/:id', protect, authorize('admin'), deleteAppointment);

export default router;
