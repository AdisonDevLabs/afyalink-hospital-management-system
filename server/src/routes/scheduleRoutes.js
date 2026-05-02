import express from 'express';
const router = express.Router();
import { 
    getAllSchedules, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment, 
    createDoctorAvailability, 
    getDoctorAvailabilities, 
    updateDoctorAvailability, 
    deleteDoctorAvailability 
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// ====================================================
// 1. SPECIFIC ROUTES (Must come BEFORE /:id)
// ====================================================

// Create Availability
router.post('/availability', protect, authorize('admin', 'doctor'), createDoctorAvailability);

// Get Availability (Doctor sees own, Admin sees all)
router.get('/availability', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getDoctorAvailabilities);

// Update Availability
router.put('/availability/:id', protect, authorize('admin', 'doctor'), updateDoctorAvailability);

// Delete Availability
router.delete('/availability/:id', protect, authorize('admin', 'doctor'), deleteDoctorAvailability);

// ====================================================
// 2. GENERAL ROUTES
// ====================================================

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getAllSchedules);

router.post('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), createAppointment);

// ====================================================
// 3. DYNAMIC ROUTES (/:id matches anything, so keep last)
// ====================================================

router.put('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), updateAppointment);

router.delete('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), deleteAppointment);

export default router;