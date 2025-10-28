const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

router.get('/profile', conditionallyProtect, authorize('guest_demo'), authController.getProfile);

module.exports = router;