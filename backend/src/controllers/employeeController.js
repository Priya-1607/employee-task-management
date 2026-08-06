const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 400);
  }

  const employee = await User.create({
    name,
    email,
    password,
    role: 'employee',
  });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee,
  });
});

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await User.find({ role: 'employee' }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees,
  });
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  res.status(200).json({
    success: true,
    data: employee,
  });
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  const { name, email, password, isActive } = req.body;

  if (email && email !== employee.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email already in use', 400);
    }
    employee.email = email;
  }

  if (name) employee.name = name;
  if (typeof isActive === 'boolean') employee.isActive = isActive;
  if (password) employee.password = password;

  await employee.save();

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee,
  });
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  await employee.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully',
  });
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};
