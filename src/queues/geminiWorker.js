require('dotenv').config();
const { Worker } = require('bullmq');
const redis = require('../config/redis');
const { sendToGemini } = require('../services/geminiService');
const db = require('../models');

const worker = new Worker('gemini', async job => {
  const { chatroomId, userId, content } = job.data;
  try {
    // Call Gemini API (mocked)
    const geminiResponse = await sendToGemini(content);
    // Save message and response
    await db.Message.create({
      chatroomId,
      userId,
      content,
      geminiResponse,
    });
    console.log(`Processed message for chatroom ${chatroomId}`);
  } catch (err) {
    console.error('Error processing Gemini job:', err);
    throw err;
  }
}, {
  connection: redis.options,
});

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
}); 