// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Add this POST route for creating new users
router.post('/', protect, authorize('admin'), userController.registerUser); // Only admin should be able to create new users from this management page

// Get all users (with optional role filter and search, e.g., /api/users?role=doctor&search=john)
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), userController.getAllUsers);

// Get user by ID (accessible by admin, or the user themselves)
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), userController.getUserById);

// Update user (admin can update any user, users can update their own profile via a separate route if needed)
router.put('/:id', protect, authorize('admin'), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

// New Route: Toggle User Status (Admin only)
router.put('/:id/toggle-status', protect, authorize('admin'), userController.toggleUserStatus);

// New Route: Request Password Reset (Admin triggered for a user)
router.post('/:id/reset-password', protect, authorize('admin'), userController.resetUserPassword);

module.exports = router;