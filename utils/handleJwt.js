const jwt = require("jsonwebtoken");
const { handleHttpError } = require("./handleError");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };