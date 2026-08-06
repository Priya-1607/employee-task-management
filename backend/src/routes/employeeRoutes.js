const express = require('express');
const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  employeeValidation,
  updateEmployeeValidation,
} = require('../validators/authValidators');

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/').get(getEmployees).post(employeeValidation, validate, createEmployee);
router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployeeValidation, validate, updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
