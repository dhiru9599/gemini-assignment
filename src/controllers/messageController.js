const geminiQueue = require('../queues/geminiQueue');
const { Message, Chatroom } = require('../models');

// POST /chatroom/:id/message
async function sendMessage(req, res) {
  const userId = req.user.userId;
  const { id: chatroomId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Message content is required' });
  try {
    // Check chatroom ownership
    const chatroom = await Chatroom.findOne({ where: { id: chatroomId, userId } });
    if (!chatroom) return res.status(404).json({ error: 'Chatroom not found' });
    // Add job to queue
    const job = await geminiQueue.add('gemini-message', { chatroomId, userId, content });
    return res.status(202).json({ message: 'Message queued', jobId: job.id });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// GET /chatroom/:id/messages
async function getMessages(req, res) {
  const userId = req.user.userId;
  const { id: chatroomId } = req.params;
  try {
    // Check chatroom ownership
    const chatroom = await Chatroom.findOne({ where: { id: chatroomId, userId } });
    if (!chatroom) return res.status(404).json({ error: 'Chatroom not found' });
    const messages = await Message.findAll({
      where: { chatroomId },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'content', 'geminiResponse', 'createdAt', 'updatedAt']
    });
    return res.json({ messages });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = {
  sendMessage,
  getMessages,
}; 