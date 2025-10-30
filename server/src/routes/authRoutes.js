// server/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- Public Routes ---
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// --- Protected Routes ---
router.get(
  '/profile',
  protect, // Verify token and attach re.user
  authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'),
  authController.getProfile);

router.post('/logout', authController.logoutUser);

module.exports = router;