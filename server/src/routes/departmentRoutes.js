const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/count', protect, authorize('receptionist', 'admin', 'doctor', 'nurse', 'guest'), departmentController.getDepartmentsCount);

router.get('/potential-heads', protect, authorize('admin', 'guest'), departmentController.getPotentialDepartmentHeads);

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), departmentController.getAllDepartments);

router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), departmentController.getDepartmentById);

router.post('/', protect, authorize('admin'), departmentController.createDepartment);

router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

router.get('/:id/staff', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), departmentController.getStaffByDepartment);

module.exports = router;