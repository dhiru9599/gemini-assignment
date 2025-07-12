const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');
const authMiddleware = require('../middlewares/auth');

router.post('/chatroom', authMiddleware, chatroomController.createChatroom);
router.get('/chatroom', authMiddleware, chatroomController.getChatrooms);
router.get('/chatroom/:id', authMiddleware, chatroomController.getChatroomById);

module.exports = router; 