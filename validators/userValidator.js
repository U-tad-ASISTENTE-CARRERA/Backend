const { body, param, query } = require("express-validator");

const validateUser = [
  body("name").isString().isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("role").isIn(["STUDENT", "TEACHER", "ADMIN"]).withMessage("Invalid role"),
  body("metadata").optional().isObject().withMessage("Metadata must be an object"),
];

const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
];

const validateUserId = [
  param("id").isString().withMessage("Invalid user ID"),
];

const validateAcademicHistoryUpdate = [
  param("id").isString().withMessage("Invalid user ID"),
  body("subject").isString().withMessage("Subject must be a string"),
  body("grade").isFloat({ min: 0, max: 10 }).withMessage("Grade must be between 0 and 10"),
];

const validateRoleUpdate = [
  param("id").isString().withMessage("Invalid user ID"),
  body("role").isIn(["STUDENT", "TEACHER", "ADMIN"]).withMessage("Invalid role"),
];

const validateUserFilter = [
  query("field").isString().withMessage("Field parameter is required"),
  query("value").isString().withMessage("Value parameter is required"),
];


const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

const validateUpdateByRole = [
  query("role").isIn(["STUDENT", "TEACHER", "ADMIN"]).withMessage("Invalid role"),
  body("data").isObject().withMessage("Update data must be an object"),
];

module.exports = {
  validateUser,
  validateLogin,
  validateUserId,
  validateAcademicHistoryUpdate,
  validateRoleUpdate,
  validateUserFilter,
  validatePagination,
  validateUpdateByRole,
};