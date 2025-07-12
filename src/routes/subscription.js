const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middlewares/auth');

router.post('/subscribe/pro', authMiddleware, subscriptionController.subscribePro);
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), subscriptionController.webhookStripe);
router.get('/subscription/status', authMiddleware, subscriptionController.getStatus);

module.exports = router; 