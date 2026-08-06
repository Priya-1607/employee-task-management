const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const { sendTokenResponse } = require('../utils/token');

const register = asyncHandler(async (req, res) => {
  const { name, email: rawEmail, password, role } = req.body;
  const email = rawEmail?.trim().toLowerCase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const userCount = await User.countDocuments();
  const roleRequested = role === 'admin' ? 'admin' : 'employee';
  const assignedRole =
    userCount === 0
      ? 'admin'
      : req.user?.role === 'admin'
      ? roleRequested
      : 'employee';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
  });

  sendTokenResponse(user, 201, res, 'Registration successful');
});

const login = asyncHandler(async (req, res) => {
  const { email: rawEmail, password } = req.body;
  const email = rawEmail?.trim().toLowerCase();

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is inactive. Contact your admin.', 403);
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email: rawEmail } = req.body;
  const email = rawEmail?.trim().toLowerCase();

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
  if (!user) {
    throw new AppError('No account found with that email', 404);
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  res.status(200).json({
    success: true,
    message: 'Password reset link generated',
    resetUrl,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password +resetPasswordToken +resetPasswordExpire');

  if (!user) {
    throw new AppError('Invalid or expired password reset token', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = { register, login, forgotPassword, resetPassword, getMe };
