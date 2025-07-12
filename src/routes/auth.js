const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/signup', authController.signup);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router; 