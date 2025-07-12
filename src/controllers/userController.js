const { User } = require('../models');

// GET /user/me
async function me(req, res) {
  const userId = req.user.userId;
  try {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'mobile', 'createdAt', 'updatedAt']
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = { me }; 