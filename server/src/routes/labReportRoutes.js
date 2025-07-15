// backend/src/routes/labReportRoutes.js
const express = require('express');
const router = express.Router();
const labReportController = require('../controllers/labReportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get lab reports (e.g., for a specific doctor or patient, with status filters)
router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), labReportController.getLabReports);

// Add a new lab report (e.g., by doctor or lab technician)
router.post('/', protect, authorize('admin', 'doctor', 'nurse'), labReportController.createLabReport);

// Get a single lab report by ID
router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), labReportController.getLabReportById);

// Update a lab report (e.g., update status or results)
router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), labReportController.updateLabReport);

// Delete a lab report (admin only)
router.delete('/:id', protect, authorize('admin'), labReportController.deleteLabReport);

module.exports = router;