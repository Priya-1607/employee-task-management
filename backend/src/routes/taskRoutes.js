const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  updateMyTaskStatus,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskValidation, updateTaskValidation, taskStatusValidation } = require('../validators/authValidators');

const router = express.Router();

router.use(protect);

router.get('/my', authorize('employee'), getMyTasks);
router.patch('/my/:id/status', authorize('employee'), taskStatusValidation, validate, updateMyTaskStatus);
router.get('/dashboard/stats', authorize('admin'), getDashboardStats);

router
  .route('/')
  .get(authorize('admin'), getTasks)
  .post(authorize('admin'), taskValidation, validate, createTask);

router
  .route('/:id')
  .get(authorize('admin'), getTask)
  .put(authorize('admin'), updateTaskValidation, validate, updateTask)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
