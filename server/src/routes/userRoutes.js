import express from 'express';
const router = express.Router();

// ❗ FIX: Import from the new userController
import {
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  resetStaffPassword // Renamed for clarity
} from '../controllers/userController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';
// We would add validation middleware here as well for updateStaff

// === Admin-Only Staff Management Routes ===
// Note: All routes are prefixed with '/api/v1/staff' in your main server file

// GET /api/v1/staff/
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getAllStaff);

// GET /api/v1/staff/:id
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), getStaffById);

// PUT /api/v1/staff/:id
router.put('/:id', protect, authorize('admin'), updateStaff);

// DELETE /api/v1/staff/:id
router.delete('/:id', protect, authorize('admin'), deleteStaff);

// PATCH /api/v1/staff/:id/toggle-status
router.patch('/:id/toggle-status', protect, authorize('admin'), toggleStaffStatus);

// POST /api/v1/staff/:id/reset-password
router.post('/:id/reset-password', protect, authorize('admin'), resetStaffPassword);

export default router;