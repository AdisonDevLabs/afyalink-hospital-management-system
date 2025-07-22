const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.getMessages);

router.post('/', protect, authorize('admin', 'doctor', 'nurse', 'receptionist'), messageController.createMessage);

router.put('/:id/read', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.markMessageAsRead);

router.delete('/:id', protect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.deleteMessage);

module.exports = router;