const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validateUser = [
    check("email")
        .isString()
        .isLength({ min: 3 }).withMessage("Email must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
        .withMessage("Invalid email format, must be @live.u-tad.com or @u-tad.com")
        .notEmpty().withMessage("Email cannot be empty"),
    
    check("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])/)
        .withMessage("Password must have at least one uppercase letter and one special character"),

    check("seedWord")
        .notEmpty().withMessage("Seed word cannot be empty"),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const validateNewPassword = [
    check("email")
        .isString()
        .isLength({ min: 3 }).withMessage("Email must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
        .withMessage("Invalid email format, must be @live.u-tad.com or @u-tad.com")
        .notEmpty().withMessage("Email cannot be empty"),
    
    check("newPassword")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])/)
        .withMessage("Password must have at least one uppercase letter and one special character"),

    check("seedWord")
        .notEmpty().withMessage("Seed word cannot be empty"),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const valitdateLogin = [
    check("email")
        .isString()
        .isLength({ min: 3 }).withMessage("Email must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
        .withMessage("Invalid email format, must be @live.u-tad.com or @u-tad.com")
        .notEmpty().withMessage("Email cannot be empty"),
    
    check("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])/)
        .withMessage("Password must have at least one uppercase letter and one special character"),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const studentMetadataSchemas = {
    "student": [
        check("name").isString().notEmpty().withMessage("Name cannot be empty"),
        check("surname").isString().notEmpty().withMessage("Surname cannot be empty"),
        check("date_of_birth").isISO8601().withMessage("Date of birth must be a valid date"),
        check("dni").isString().notEmpty().withMessage("DNI cannot be empty"),
        check("degree").isString().notEmpty().withMessage("Degree cannot be empty"),
        check("specialization").isString().notEmpty().withMessage("Specialization cannot be empty"),
        check("institution").isString().notEmpty().withMessage("Institution cannot be empty"),
        check("graduation_date").isISO8601().withMessage("Graduation date must be a valid date"),
    ],

    "languages": [
        check("language").isString().notEmpty().withMessage("Language name cannot be empty"),
        check("level").isIn(["low", "medium", "high"]).withMessage("Level must be 'low', 'medium' or 'high'")
    ],

    "academic_history": [
        check("name").isString().notEmpty().withMessage("Subject name cannot be empty"),
        check("grade").isFloat({ min: 0.0, max: 10.0 }).withMessage("Grade must be between 0.0 and 10.0"),
    ],

    "certifications": [
        check("name").isString().notEmpty().withMessage("Certificate name cannot be empty"),
        check("date").isISO8601().withMessage("Certificate date must be a valid date"),
        check("institution").isString().notEmpty().withMessage("Institution cannot be empty")
    ],

    "work_experience": [
        check("job_type").isString().notEmpty().withMessage("Job type cannot be empty"),
        check("start_date").isISO8601().withMessage("Start date must be a valid date"),
        check("end_date").isISO8601().withMessage("End date must be a valid date"),
        check("company").isString().notEmpty().withMessage("Company cannot be empty"),
        check("description").isString().notEmpty().withMessage("Description cannot be empty"),
        check("responsibilities").isString().notEmpty().withMessage("Responsibilities cannot be empty")
    ],
};

const validateMetadata = (key) => {
    if (!studentMetadataSchemas[key]) {
        throw new Error(`No validations defined for the key '${key}'`);
    }

    return [
        ...studentMetadataSchemas[key],
        (req, res, next) => validateResults(req, res, next)
    ];
};

module.exports = {
  validateUser,
  valitdateLogin,
  validateNewPassword,
  validateMetadata,
};