import express from 'express';
const router = express.Router();
import { getMessages, createMessage, markMessageAsRead, deleteMessage } from '../controllers/messageController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), getMessages);

router.post('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), createMessage);

router.put('/:id/read', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), markMessageAsRead);

router.delete('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), deleteMessage);

export default router;