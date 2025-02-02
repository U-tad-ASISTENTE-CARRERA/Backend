const { validationResult } = require("express-validator")

const validateResults = (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorCodes = errors.array().map(error => error.msg)
            res.status(400).json({ errors: errorCodes })
        } else {
            next()
        }
    } catch (err) {
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = validateResults