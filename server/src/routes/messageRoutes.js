const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/authMiddleware');

const conditionallyProtect = (req, res, next) => {
  protect(req, res, next);
};

router.get('/', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient', 'guest_demo'), messageController.getMessages);

router.post('/', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist'), messageController.createMessage);

router.put('/:id/read', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.markMessageAsRead);

router.delete('/:id', conditionallyProtect, authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), messageController.deleteMessage);

module.exports = router;