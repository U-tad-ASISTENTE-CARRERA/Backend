const { check, param, body } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validateRoadmap = [
    body("name").notEmpty().withMessage("Roadmap name is required."),
    body("mention").optional().isString().withMessage("Mention must be a string."),
    body("description").notEmpty().withMessage("Description is required."),
    body("label").isArray({ min: 1 }).withMessage("Label must be an array with at least one item."),
    body("year").isInt().withMessage("Year must be an integer."),
    body("recommendedLabels").optional().isArray().withMessage("Recommended labels must be an array."),
    body("link").notEmpty().withMessage("Link is required."),
    
    (req, res, next) => {
        // Ensure no undefined values in request body
        Object.keys(req.body).forEach(key => {
            if (req.body[key] === undefined) {
                delete req.body[key];
            }
        });
        return validateResults(req, res, next);
    }
];

module.exports = { validateRoadmap };