const { check, param, body } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validateSubject = [
    body("subjects").isArray({ min: 1 }).withMessage("Subjects must be a non-empty array."),
    body("subjects.*.name").notEmpty().withMessage("Subject name is required."),
    body("subjects.*.credits").isInt({ min: 1 }).withMessage("Credits must be a positive integer."),
    body("subjects.*.label").notEmpty().withMessage("Label is required."),
    body("subjects.*.type").notEmpty().withMessage("Type is required."),
    body("subjects.*.skills").isArray().withMessage("Skills must be an array."),
    body("subjects.*.year").isInt({ min: 1 }).withMessage("Year must be a positive integer."),
  
    (req, res, next) => {
      return validateResults(req, res, next);
    },
];

module.exports = { validateSubject };