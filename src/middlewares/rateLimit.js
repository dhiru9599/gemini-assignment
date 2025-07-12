const redis = require('../config/redis');
const { Subscription } = require('../models');

const DAILY_LIMIT = 5;

async function rateLimit(req, res, next) {
  const userId = req.user.userId;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `rate:${userId}:${today}`;

  // Check subscription tier
  const sub = await Subscription.findOne({ where: { userId } });
  if (sub && sub.tier === 'pro' && sub.status === 'active') {
    return next(); // No limit for Pro
  }

  // Increment and check count in Redis
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 24 * 60 * 60); // Set TTL to 24h
  }
  if (count > DAILY_LIMIT) {
    return res.status(429).json({ error: 'Daily message limit reached for Basic users (5 per day). Upgrade to Pro for more.' });
  }
  next();
}

module.exports = rateLimit; 