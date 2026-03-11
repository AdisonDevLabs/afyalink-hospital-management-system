import express from 'express';
const router = express.Router();
import { getDepartmentsCount, getPotentialDepartmentHeads, getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, getStaffByDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/count', protect, authorize('receptionist', 'admin', 'doctor', 'nurse', 'guest'), getDepartmentsCount);

router.get('/potential-heads', protect, authorize('admin', 'guest'), getPotentialDepartmentHeads);

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getAllDepartments);

router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getDepartmentById);

router.post('/', protect, authorize('admin'), createDepartment);

router.put('/:id', protect, authorize('admin'), updateDepartment);

router.delete('/:id', protect, authorize('admin'), deleteDepartment);

router.get('/:id/staff', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getStaffByDepartment);

export default router;