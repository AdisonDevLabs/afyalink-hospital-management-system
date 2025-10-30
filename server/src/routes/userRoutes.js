const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

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

router.get('/profile', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'guest_demo'), userController.getProfile);

router.put('/profile', conditionallyProtect, upload.single('profile_picture'), userController.updateProfile);

router.post('/', conditionallyProtect, authorize('admin'), userController.registerUser);

router.get('/', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), userController.getAllUsers);

router.get('/:id', conditionallyProtect, authorize('admin', 'doctor', 'receptionist', 'nurse', 'guest_demo'), userController.getUserById);

router.put('/:id', conditionallyProtect, authorize('admin'), userController.updateUser);

router.delete('/:id', conditionallyProtect, authorize('admin'), userController.deleteUser);

router.put('/:id/toggle-status', conditionallyProtect, authorize('admin'), userController.toggleUserStatus);

router.post('/:id/reset-password', conditionallyProtect, authorize('admin'), userController.resetUserPassword);

module.exports = router;