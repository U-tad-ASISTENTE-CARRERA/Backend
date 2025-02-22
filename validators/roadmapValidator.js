const { check, body } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validateRoadmap = [
    body("roadmap.name").notEmpty().withMessage("Roadmap name is required."),
    body("roadmap.body").isObject().withMessage("Body must be an object."),
    
    (req, res, next) => {
        return validateResults(req, res, next);
      },
];

const validateRoadmapBody = [
    body("updates").isObject().withMessage("Updates must be an object."),
    
    (req, res, next) => {
        return validateResults(req, res, next);
    },
];

module.exports = { validateRoadmap, validateRoadmapBody };