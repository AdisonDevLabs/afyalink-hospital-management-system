const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../controllers/userController');
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

router.get('/profile', protect, userController.getProfile);

router.put('/profile', protect, upload.single('profile_picture'), userController.updateProfile);

router.post('/', protect, authorize('admin'), userController.registerUser);

router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), userController.getAllUsers);

router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest'), userController.getUserById);

router.put('/:id', protect, authorize('admin'), userController.updateUser);

router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

router.put('/:id/toggle-status', protect, authorize('admin'), userController.toggleUserStatus);

router.post('/:id/reset-password', protect, authorize('admin'), userController.resetUserPassword);

module.exports = router;