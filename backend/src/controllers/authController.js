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
  const assignedRole = userCount === 0 ? 'admin' : role || 'employee';

  if (assignedRole === 'admin' && userCount > 0 && req.user?.role !== 'admin') {
    throw new AppError('Only admins can create admin accounts', 403);
  }

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

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = { register, login, getMe };
