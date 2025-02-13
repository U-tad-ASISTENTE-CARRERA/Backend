const handleHttpError = (res, message, code = 403) => {
    res.status(code).json({ error: message });
};


module.exports = { handleHttpError }