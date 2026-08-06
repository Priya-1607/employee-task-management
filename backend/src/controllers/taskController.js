const Task = require('../models/Task');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, dueDate, status } = req.body;

  const employee = await User.findOne({ _id: assignedTo, role: 'employee', isActive: true });
  if (!employee) {
    throw new AppError('Assigned employee not found or inactive', 400);
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    dueDate,
    status: status || 'Todo',
    createdBy: req.user._id,
  });

  await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find()
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const { title, description, assignedTo, dueDate, status } = req.body;

  if (assignedTo) {
    const employee = await User.findOne({ _id: assignedTo, role: 'employee', isActive: true });
    if (!employee) {
      throw new AppError('Assigned employee not found or inactive', 400);
    }
    task.assignedTo = assignedTo;
  }

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (status) task.status = status;

  await task.save();
  await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user._id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

const updateMyTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    assignedTo: req.user._id,
  });

  if (!task) {
    throw new AppError('Task not found or not assigned to you', 404);
  }

  task.status = req.body.status;
  await task.save();
  await task.populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: task,
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalEmployees, totalTasks, statusCounts] = await Promise.all([
    User.countDocuments({ role: 'employee', isActive: true }),
    Task.countDocuments(),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const tasksByStatus = {
    Todo: 0,
    'In Progress': 0,
    Completed: 0,
  };

  statusCounts.forEach(({ _id, count }) => {
    tasksByStatus[_id] = count;
  });

  res.status(200).json({
    success: true,
    data: {
      totalEmployees,
      totalTasks,
      tasksByStatus,
      completionRate:
        totalTasks === 0
          ? 0
          : Math.round((tasksByStatus.Completed / totalTasks) * 100),
    },
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  updateMyTaskStatus,
  getDashboardStats,
};
