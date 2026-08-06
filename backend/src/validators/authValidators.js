const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'employee'])
    .withMessage('Role must be admin or employee'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
];

const employeeValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const updateEmployeeValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('assignedTo').notEmpty().withMessage('Assigned employee is required'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Invalid status'),
];

const taskStatusValidation = [
  body('status')
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Status must be Todo, In Progress, or Completed'),
];

const updateTaskValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('assignedTo').optional().notEmpty().withMessage('Assigned employee is required'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed'])
    .withMessage('Invalid status'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  employeeValidation,
  updateEmployeeValidation,
  taskValidation,
  updateTaskValidation,
  taskStatusValidation,
};
