const { Queue } = require('bullmq');
const redis = require('../config/redis');

const geminiQueue = new Queue('gemini', {
  connection: redis.options,
});

module.exports = geminiQueue; 