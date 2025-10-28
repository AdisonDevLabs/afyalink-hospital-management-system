const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), labReportController.getLabReports);

router.post('/', conditionallyProtect, authorize('admin', 'doctor', 'nurse'), labReportController.createLabReport);

router.get('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), labReportController.getLabReportById);

router.put('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse'), labReportController.updateLabReport);

router.delete('/:id', conditionallyProtect, authorize('admin'), labReportController.deleteLabReport);

module.exports = router;