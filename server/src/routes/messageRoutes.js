// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get messages for a recipient (e.g., doctor_id, patient_id) with type filter
router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.getMessages);

// Send a new message/notification
router.post('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), messageController.createMessage);

// Mark a message as read
router.put('/:id/read', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.markMessageAsRead);

// Delete a message
router.delete('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.deleteMessage);

module.exports = router;