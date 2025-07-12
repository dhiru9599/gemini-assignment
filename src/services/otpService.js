const crypto = require('crypto');

function generateOtp() {
  // Generate a 6-digit OTP
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

function isOtpValid(user, otp) {
  if (!user.otp || !user.otpExpiresAt) return false;
  const now = new Date();
  return user.otp === otp && user.otpExpiresAt > now;
}

module.exports = {
  generateOtp,
  isOtpValid,
};