// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Correctly import authController
const { protect } = require('../middleware/authMiddleware'); // Assuming protect middleware is here

// Public routes
router.post('/register', authController.registerUser); // Register user through authController
router.post('/login', authController.loginUser); // Login user through authController

// Protected route - e.g., to get the logged-in user's profile
router.get('/profile', protect, authController.getProfile); // Get profile through authController

module.exports = router;