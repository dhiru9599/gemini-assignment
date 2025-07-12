const { Chatroom } = require('../models');
const redis = require('../config/redis');

// POST /chatroom
async function createChatroom(req, res) {
  const userId = req.user.userId;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Chatroom name is required' });
  try {
    const chatroom = await Chatroom.create({ userId, name });
    return res.status(201).json({ chatroom });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// GET /chatroom
async function getChatrooms(req, res) {
  const userId = req.user.userId;
  const cacheKey = `chatrooms:${userId}`;
  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ chatrooms: JSON.parse(cached), cached: true });
    }
    // Fetch from DB
    const chatrooms = await Chatroom.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    // Cache result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(chatrooms), 'EX', 300);
    return res.json({ chatrooms, cached: false });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// GET /chatroom/:id
async function getChatroomById(req, res) {
  const userId = req.user.userId;
  const { id } = req.params;
  try {
    const chatroom = await Chatroom.findOne({ where: { id, userId } });
    if (!chatroom) return res.status(404).json({ error: 'Chatroom not found' });
    return res.json({ chatroom });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = {
  createChatroom,
  getChatrooms,
  getChatroomById,
}; 