import express from 'express';
const router = express.Router();
import { getBedOccupancy } from '../controllers/bedController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/availability', protect, authorize('nurse', 'doctor', 'admin', 'receptionist', 'guest'), getBedOccupancy);

export default router;