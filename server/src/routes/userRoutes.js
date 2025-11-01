// server/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `profile-${userId}-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// --- Public/Read-Only Endpoints ---

// GET /api/users/
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), adminController.getAllUsers);

// GET /api/users/:id
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), adminController.getUserById);

// -- Self-Service Profile Management ---

// GET /api/users/profile
router.get('/profile', protect, userController.getProfile);

// PUT /api/users/profile
router.put('/profile', protect, upload.single('profile_picture'), userController.updateProfile);

module.exports = router;