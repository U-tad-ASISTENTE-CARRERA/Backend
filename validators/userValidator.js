const { body, param, query } = require("express-validator");

const validateUser = [
    body("name")
    .isString().isLength({ min: 3 }).withMessage("Como minimo 3 caractéres de tamaño")
    .isEmpty({ ignore_whitespace: false }).withMessage("Name cannot be empty"),
    body("email")
    .isString().isLength({ min: 3 }).withMessage("Como minimo 3 caractéres de tamaño")
    .isEmpty({ ignore_whitespace: false })
    .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
    .isEmpty({ ignore_whitespace: false }).withMessage("Email cannot be empty")
    .withMessage("Invalid email format, must be @live.u-tad.com or @u-tad.com"),
    body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&]).$/),
    body("metadata").optional().isObject().withMessage("Metadata must be an object"),
    
    //middleware para manejar errores
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const valitdateLogin = [
    body("email")
    .isString().isLength({ min: 3 }).withMessage("Como minimo 3 caractéres de tamaño")
    .isEmpty({ ignore_whitespace: false })
    .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
    .isEmpty({ ignore_whitespace: false }).withMessage("Email cannot be empty")
    .withMessage("Invalid email format, must be @live.u-tad.com or @u-tad.com"),
    body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&]).$/),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserId = [
    param("id")
    .isString().withMessage("Id cant be a string")
    .isEmpty({ ignore_whitespace: false }).withMessage("Id cannot be empty"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }

];

const validateAcademicHistoryUpdate = [
    //Recibo de un pdf
    param("id")
    .isString().withMessage("Id cant be a string")
    .isEmpty({ ignore_whitespace: false }).withMessage("Id cannot be empty"),
    body("subject")
    .isString().withMessage("Subject must be a string")
    .isLength({ min: 3 }).withMessage("Subject must be at least 3 characters long"),
    body("grade").isFloat({ min: 0, max: 10 }).withMessage("Grade must be between 0 and 10"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
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