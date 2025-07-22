const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), labReportController.getLabReports);

router.post('/', protect, authorize('admin', 'doctor', 'nurse'), labReportController.createLabReport);

router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), labReportController.getLabReportById);

router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), labReportController.updateLabReport);

router.delete('/:id', protect, authorize('admin'), labReportController.deleteLabReport);

module.exports = router;