const { db } = require("../config/firebase");
const { handleHttpError } = require("../utils/handleError");
const { verifyToken } = require("../utils/handleJwt");

const getTokenData = async (req, res) => {
    try {
        if (!req.headers.authorization) {
            return handleHttpError(res, "TOKEN_NOT_PROVIDED", 401);
        }

        const token = req.headers.authorization.split(" ")[1]; 
        const dataToken = verifyToken(token);

        if (!dataToken) {
            return handleHttpError(res, "INVALID_TOKEN", 401);
        }

        return dataToken;
    } catch (error) {
        console.error("Error getting token data:", error.message);
        return handleHttpError(res, "TOKEN_ERROR", 401);
    }
};

const authUserMiddleware = async (req, res, next) => {
    try {
        const dataToken = await getTokenData(req, res);
        if (!dataToken) return;

        const { id } = dataToken;
        const userDoc = await db.collection("users").doc(id).get();

        if (!userDoc.exists) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        req.user = userDoc.data();
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        return handleHttpError(res, "AUTHENTICATION_ERROR", 401);
    }
};

const checkRole = (allowedRoles) => (req, res, next) => {
    try {
        if (!req.user) {
            return handleHttpError(res, "USER_NOT_FOUND", 403);
        }

        const { role } = req.user;
        if (!allowedRoles.includes(role)) {
            return handleHttpError(res, "ACCESS_DENIED", 403);
        }

        next();
    } catch (err) {
        console.error("Role Check Error:", err);
        return handleHttpError(res, "PERMISSION_ERROR", 403);
    }
};

module.exports = { authUserMiddleware, checkRole };
