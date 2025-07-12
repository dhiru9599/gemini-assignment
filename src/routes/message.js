const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/auth');
const rateLimit = require('../middlewares/rateLimit');

router.post('/chatroom/:id/message', authMiddleware, rateLimit, messageController.sendMessage);
router.get('/chatroom/:id/messages', authMiddleware, messageController.getMessages);

module.exports = router; 