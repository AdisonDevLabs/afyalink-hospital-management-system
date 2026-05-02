import express from 'express';
const router = express.Router();
import { getLabReports, createLabReport, getLabReportById, updateLabReport, deleteLabReport } from '../controllers/labReportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest'), getLabReports);

router.post('/', protect, authorize('admin', 'doctor', 'nurse'), createLabReport);

router.get('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest'), getLabReportById);

router.put('/:id', protect, authorize('admin', 'doctor', 'nurse'), updateLabReport);

router.delete('/:id', protect, authorize('admin'), deleteLabReport);

export default router;