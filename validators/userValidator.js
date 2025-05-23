const { check, body} = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validateUser = [
    check("email")
        .isString()
        .isLength({ min: 3 }).withMessage("Email must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com)$/)
        .withMessage("El correo debe terminar en @live.u-tad.com o @u-tad.com")
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
        .withMessage("El correo debe terminar en @live.u-tad.com o @u-tad.com")
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

const validateLogin = [
    check("email")
        .isString()
        .isLength({ min: 3 }).withMessage("Email must be at least 3 characters long")
        .matches(/^[a-zA-Z0-9._%+-]+@(live\.u-tad\.com|u-tad\.com|gmail\.com)$/)
        .withMessage("El correo debe terminar en @live.u-tad.com o @u-tad.com")
        .notEmpty().withMessage("Email cannot be empty"),
    
    check("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[A-Z])(?=.*[@$!%*?&])/)
        .withMessage("Password must have at least one uppercase letter and one special character"),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
];

const METADATA_FIELDS = {
    STUDENT: new Set([
        "firstName", "lastName", "birthDate", "gender", "dni", "degree", "endDate", "specialization", "languages", "programming_languages", "certifications", "jobOffers", "workExperience", "academicHistory"
    ]),
    TEACHER: new Set([
        "firstName", "lastName", "gender", "dni", "specialization"
    ]),
};

const validateArrayObjects = (field, properties) => {
    return body(field)
        .if(body(field).exists())
        .isArray().withMessage(`${field} must be an array`)
        .notEmpty().withMessage(`${field} cannot be empty`)
        .custom((items) => {
            for (const item of items) {
                const hasId = item.hasOwnProperty('_id');
            
                for (const prop of properties) {
                    if (!item.hasOwnProperty(prop.name)) throw new Error(`${field} -> Each object must contain "${prop.name}"`);
                    if (typeof item[prop.name] !== prop.type) throw new Error(`${field} -> "${prop.name}" must be of type ${prop.type}`);
                    if (prop.enum && !prop.enum.includes(item[prop.name])) throw new Error(`${field} -> "${prop.name}" must be one of: ${prop.enum.join(", ")}`);
                }
            }
            
            return true;
        }
    );
};
  
const validateMetadata = [
    body().custom((body, { req }) => {
        const role = req.user?.role;
        if (!role || !METADATA_FIELDS[role]) throw new Error("Invalid user role for metadata update");
      
        for (const field in body) if (!METADATA_FIELDS[role].has(field)) throw new Error(`Invalid field: ${field} for role: ${role}`);
        return true;
    }),
  
    check("firstName").if(body("firstName").exists()).isString().notEmpty().withMessage("firstName must be a non-empty string"),
    check("lastName").if(body("lastName").exists()).isString().notEmpty().withMessage("lastName must be a non-empty string"),
    check("gender").if(body("gender").exists()).isString().isIn(["male", "female", "prefer not to say"]).withMessage("gender must be one of: male, female, or prefer not to say"),
    check("dni").if(body("dni").exists()).matches(/^\d{8}[A-Z]$/).withMessage("dni must be in the format 12345678A"),
    check("degree").if(body("degree").exists()).isString().isIn(["INSO_DATA"]).withMessage("degree must be one of MAIS, FIIS, INSO_GAME, INSO_DATA, or INSO_CYBER"),
    check("endDate").if(body("endDate").exists()).isISO8601().toDate().withMessage("endDate must be a valid date"),
    check("specialization").if(body("specialization").exists()).isString().notEmpty().withMessage("specialization must be a non-empty string"),
    check("birthDate").if(body("birthDate").exists()).isISO8601().toDate().withMessage("birthDate must be a valid date"),
  
    validateArrayObjects("languages", [
        { name: "language", type: "string" },
        { name: "level", type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
    ]),
  
    validateArrayObjects("programming_languages", [
        { name: "name", type: "string" },
        { name: "level", type: "string", enum: ["low", "medium", "high"] },
    ]),
  
    // validateArrayObjects("skills", [
    //     { name: "skill", type: "string" },
    // ]),
  
    validateArrayObjects("certifications", [
        { name: "name", type: "string" },
        { name: "date", type: "string" },
        { name: "institution", type: "string" },
    ]),
  
    validateArrayObjects("workExperience", [
        { name: "jobType", type: "string" },
        { name: "startDate", type: "string" }, 
        { name: "endDate", type: "string" },
        { name: "company", type: "string" },
        { name: "description", type: "string" },
        { name: "responsibilities", type: "string" },
    ]),
  
    validateArrayObjects("jobOffers", [
        { name: "title", type: "string" },
        { name: "url", type: "string" },
        { name: "source", type: "string" }, 
        { name: "date", type: "string" }, 
        { name: "favoriteDate", type: "string" }, 
        { name: "lastVisited", type: "string" }, 
        { name: "visitCount", type: "number" }, 
        { name: "jobType", type: "string" }, 
        { name: "location", type: "string" }, 
        { name: "company", type: "string" }, 
        { name: "keywords", type: "string" }, 
    ]),
  
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

module.exports = {
  validateUser,
  validateLogin,
  validateNewPassword,
  validateMetadata,
};