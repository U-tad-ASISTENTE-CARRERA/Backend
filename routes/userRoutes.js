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
    updateAH,
    getAH,
    addTeacherToStudent,
    getAllTeacher,
    getAllStudents,
    getSpecializationTeacher,
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
router.patch("/", authUserMiddleware, updateUser);
router.get("/", authUserMiddleware, getUserProfile);
router.patch("/", authUserMiddleware, updateSeedWord);

router.get("/metadata", authUserMiddleware, getUserMetadata);
router.patch("/metadata", authUserMiddleware, validateMetadata, updateUserMetadata);
router.delete("/metadata", authUserMiddleware, validateMetadata, deleteUserMetadata);

// Student routes
router.get("/AH", authUserMiddleware, checkRole("STUDENT"), getAH);
router.patch("/AH", authUserMiddleware, checkRole("STUDENT"), updateAH);

// router.get("/RoadmapStudent", authUserMiddleware, checkRole("STUDENT"), getRoadmaps);
// router.patch("/RoadmapStudent", authUserMiddleware, checkRole("STUDENT"), updateRoadmap);
// router.delete("/RoadmapStudent", authUserMiddleware, checkRole("STUDENT"), deleteRoadmap);

// Admin routes
router.post("/admin", createAdmin);
router.get("/admin", authUserMiddleware, checkRole("ADMIN"), getAllUsers);
router.patch("/admin/:id", authUserMiddleware, checkRole("ADMIN"), updateUserByAdmin);
router.delete("/admin/:id", authUserMiddleware, checkRole("ADMIN"), deleteUserByAdmin);

module.exports = router;
