// server/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Dashboard / Stats ---

//GET /api/admin/stats
router.get('/stats', protect, authorize('admin', 'guest_demo'), adminController.getAdminStats);

// GET /api/admin/appointments/status-counts
router.get('/appointments/status-counts', protect, authorize('admin', 'guest_demo'), adminController.getAppointmentStatusCounts);

// -- User Management ---

// POST /api/admin/users
router.post('/users', protect, authorize('admin'), adminController.registerUser);

// GET /api/admin/users
router.get('/users', protect, authorize('admin', 'guest_demo'), adminController.getAllUsers);

// GET /api/admin/users/:id
router.get('/users/:id', protect, authorize('admin', 'guest)demo'), adminController.getUserById);

// PUT /api/admin/users/:id
router.put('/users/:id', protect, authorize('admin'), adminController.updateUser);

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('admin'), adminController.deleteUser);

// PUT /api/admin/users/:id/toggle-status
router.put('/users/:id/toggle-status', protect, authorize('admin'), adminController.toggleUserStatus);

// POST /api/admin/users/:id/reset-password
router.post('/users/:id/reset-password', protect, authorize('admin'), adminController.resetUserPassword);


module.exports = router;