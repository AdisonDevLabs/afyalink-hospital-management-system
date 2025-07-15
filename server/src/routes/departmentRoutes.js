// backend/src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get(
  '/count',
  protect,
  authorize('receptionist', 'admin', 'doctor', 'nurse'), // Adjust roles as needed
  departmentController.getDepartmentsCount
);

// Get potential department heads (Admin only, as assigning heads is an admin task)
// IMPORTANT: This specific route MUST come before the general '/:id' route
router.get('/potential-heads', protect, authorize('admin'), departmentController.getPotentialDepartmentHeads);

// Get all departments (Accessible by admin, doctor, receptionist, nurse)
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), departmentController.getAllDepartments);

// Get department by ID (Accessible by admin, doctor, receptionist, nurse)
// This should come AFTER specific routes like /potential-heads
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), departmentController.getDepartmentById);

// Create a new department (Admin only)
router.post('/', protect, authorize('admin'), departmentController.createDepartment);

// Update a department (Admin only)
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

// Delete a department (Admin only)
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

// Get staff (doctors) by department ID (Accessible by admin, doctor, receptionist, nurse)
// This also needs to be specific enough or placed correctly
router.get('/:id/staff', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), departmentController.getStaffByDepartment);


module.exports = router;