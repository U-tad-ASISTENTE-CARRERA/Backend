const express = require("express");

const { 
    registerUser, 
    loginUser, 
    updatePassword, 
    logoutUser, 
    getUserProfile, 
    updateSeedWord, 
    updateUserMetadata, 
    deleteUserMetadata 
} = require("../controllers/userController");

const { 
    validateUser, 
    validateLogin, 
    validateNewPassword, 
    validateMetadata 
} = require("../validators/userValidator");

const { authUserMiddleware, checkRole } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", validateLogin, loginUser);
router.post("/register", validateUser, registerUser);
router.put("/updatePassword", authUserMiddleware, validateNewPassword, updatePassword);
router.post("/logout", authUserMiddleware, logoutUser);

router.get("/", authUserMiddleware, getUserProfile);
router.patch("/", authUserMiddleware, updateSeedWord);

router.patch("/metadata", authUserMiddleware, validateMetadata, updateUserMetadata);
router.delete("/metadata", authUserMiddleware, validateMetadata, deleteUserMetadata);

module.exports = router;
