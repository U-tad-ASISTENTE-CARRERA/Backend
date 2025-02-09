const { check, param, body} = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validateDegree = [
    body("name").notEmpty().withMessage("Degree name is required."),
    body("subjects").isArray().optional(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
];
    
const validateSubject = [
    param("degreeId").notEmpty().withMessage("Degree ID is required."),
    body("mencion").optional().isString(),
    body("name").notEmpty().withMessage("Subject name is required."),
    body("credits").isInt({ min: 1 }).withMessage("Credits must be a positive integer."),
    body("label").notEmpty().withMessage("Label is required."),
    body("type").notEmpty().withMessage("Type is required."),
    body("languages").isArray().optional(),
    body("year").isInt({ min: 1 }).withMessage("Year must be a positive integer."),
    
    (req, res, next) => {
        return validateResults(req, res, next)
    }
];
    
module.exports = { validateDegree, validateSubject };