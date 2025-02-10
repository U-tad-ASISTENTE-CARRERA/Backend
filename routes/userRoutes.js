const express = require("express");

const { 
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    updatePassword,
    updateSeedWord,
    deleteUser,
    getUserProfile,
    getUserMetadata,
    updateUserMetadata,
    deleteUserMetadata,
    getAllStudents,
    getSpecializationStudent,
    getStudent,
    createAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
} = require("../controllers/userController");

const { 
    validateUser, 
    validateLogin, 
    validateNewPassword, 
    validateMetadata 
} = require("../validators/userValidator");

const { authUserMiddleware, checkRole } = require("../middlewares/auth");

const router = express.Router();

// User routes
router.post("/login", validateLogin, loginUser);
router.post("/register", validateUser, registerUser);
router.put("/updatePassword", validateNewPassword, updatePassword);
router.post("/logout", authUserMiddleware, logoutUser);
router.delete("/", authUserMiddleware, deleteUser);
router.put("/", authUserMiddleware, updateUser);

router.get("/", authUserMiddleware, getUserProfile);
router.patch("/", authUserMiddleware, updateSeedWord);

router.get("/metadata", authUserMiddleware, getUserMetadata);
router.patch("/metadata", authUserMiddleware, validateMetadata, updateUserMetadata);
router.delete("/metadata", authUserMiddleware, validateMetadata, deleteUserMetadata);

// Student routes


// Teacher routes
router.get("/teacher", authUserMiddleware, checkRole("teacher"), getAllStudents);
router.get("/teacher/specialization", authUserMiddleware, checkRole("teacher"), getSpecializationStudent);
router.get("/teacher/:id", authUserMiddleware, checkRole("teacher"), getStudent);
router.patch("/teacher/:id", authUserMiddleware, checkRole("teacher"), updateUserMetadata);
router.delete("/teacher/:id", authUserMiddleware, checkRole("teacher"), deleteUserMetadata);

// Admin routes
router.post("/admin", createAdmin);
router.get("/admin", authUserMiddleware, checkRole("admin"), getAllUsers);
router.patch("/admin/:id", authUserMiddleware, checkRole("admin"), updateUserByAdmin);
router.delete("/admin/:id", authUserMiddleware, checkRole("admin"), deleteUserByAdmin);

module.exports = router;
