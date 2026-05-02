import express from 'express';
import multer, { diskStorage } from 'multer';
import path, { join, extname } from 'path';
import { fileURLToPath } from 'url';

// --- Controllers ---
import {
  registerPatient,
  loginUser,
  getProfile,
  registerStaff,
  updateProfile // <-- Import the new updateProfile controller
} from '../controllers/authController.js';

// --- Middleware ---
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

// --- Schemas ---
import { patientRegistrationSchema } from '../validators/patientRegistrationSchema.js';
import { staffRegistrationSchema } from '../validators/staffRegistrationSchema.js';
import { loginSchema } from '../validators/loginSchema.js';

const router = express.Router();

// === Multer Config for Profile Picture Uploads ===
// (Moved from userRoutes.js)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = diskStorage({
  destination: (req, file, cb) => {
    // This path is relative to the server root
    cb(null, join(__dirname, '..', '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    // Use req.user.id set by the 'protect' middleware
    const userId = req.user?.id; 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = extname(file.originalname);
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// === Public Routes ===

// POST /api/v1/auth/register-patient
router.post('/register-patient', validate(patientRegistrationSchema), registerPatient);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), loginUser);

// === Protected Routes ===

// POST /api/v1/auth/register-staff (Admin creates a new staff member)
router.post('/register-staff', protect, authorize('admin'), validate(staffRegistrationSchema), registerStaff);

// GET /api/v1/auth/profile (User gets their OWN profile)
router.get('/profile', protect, getProfile);

// PUT /api/v1/auth/profile (User updates their OWN profile)
router.put(
  '/profile',
  protect,
  upload.single('profile_picture'), // Use multer for this route
  updateProfile 
);

export default router;