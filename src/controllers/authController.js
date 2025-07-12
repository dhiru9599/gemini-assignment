const { User } = require('../models');
const { generateOtp, isOtpValid } = require('../services/otpService');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// POST /auth/signup
async function signup(req, res) {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });
  try {
    let user = await User.findOne({ where: { mobile } });
    if (user) return res.status(400).json({ error: 'User already exists' });
    user = await User.create({ mobile });
    return res.status(201).json({ message: 'User registered', user: { id: user.id, mobile: user.mobile } });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// POST /auth/send-otp
async function sendOtp(req, res) {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });
  try {
    let user = await User.findOne({ where: { mobile } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const otp = generateOtp();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    user.otp = otp;
    user.otpExpiresAt = expires;
    await user.save();
    // In real app, send OTP via SMS. Here, return in response (mocked)
    return res.json({ message: 'OTP sent (mocked)', otp });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// POST /auth/verify-otp
async function verifyOtp(req, res) {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP are required' });
  try {
    const user = await User.findOne({ where: { mobile } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!isOtpValid(user, otp)) return res.status(400).json({ error: 'Invalid or expired OTP' });
    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    const token = generateToken({ userId: user.id });
    return res.json({ message: 'OTP verified', token });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

// POST /auth/forgot-password
async function forgotPassword(req, res) {
  // Reuse sendOtp logic
  return await module.exports.sendOtp(req, res);
}

// POST /auth/change-password
async function changePassword(req, res) {
  const userId = req.user.userId; // set by auth middleware
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) return res.status(400).json({ error: 'OTP and new password are required' });
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!isOtpValid(user, otp)) return res.status(400).json({ error: 'Invalid or expired OTP' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();
    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = {
  signup,
  sendOtp,
  verifyOtp,
  forgotPassword,
  changePassword,
}; 