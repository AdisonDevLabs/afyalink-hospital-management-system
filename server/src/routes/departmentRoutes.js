const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/count', conditionallyProtect, authorize('receptionist', 'admin', 'doctor', 'nurse', 'guest_demo'), departmentController.getDepartmentsCount);

router.get('/potential-heads', conditionallyProtect, authorize('admin', 'guest_demo'), departmentController.getPotentialDepartmentHeads);

router.get('/', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getAllDepartments);

router.get('/:id', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getDepartmentById);

router.post('/', protect, authorize('admin'), departmentController.createDepartment);

router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

router.get('/:id/staff', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), departmentController.getStaffByDepartment);

module.exports = router;