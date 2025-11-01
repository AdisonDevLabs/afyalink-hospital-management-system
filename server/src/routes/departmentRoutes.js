// server/src/routes/departmentRoutes.js

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/departments/count
router.get('/count', protect, authorize('receptionist', 'admin', 'doctor', 'nurse', 'guest_demo'), departmentController.getDepartmentsCount);

// GET /api/departments/portential-heads
router.get('/potential-heads', protect, authorize('admin','receptionist', 'doctor', 'guest_demo'), departmentController.getPotentialDepartmentHeads);

// GET /api/departments
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getAllDepartments);

// GET /api/departments/:id
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getDepartmentById);

// POST /api/departments
router.post('/', protect, authorize('admin'), departmentController.createDepartment);

// PUT /api/departments/:id
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

// DELETE /api/departments/:id
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

// GET /api/departments/:id/staff
router.get('/:id/staff', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getStaffByDepartment);

module.exports = router;