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
    updateRoadmap,
    getRoadmap,
    deleteRoadmap,
    addTeacherToStudent,
    getTeachersOfStudent,
    sendNotificationToTeacher,
    getTeacherNotifications,
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

router.get("/userRoadmap", authUserMiddleware, checkRole("STUDENT"), getRoadmap);
router.patch("/userRoadmap", authUserMiddleware, checkRole("STUDENT"), updateRoadmap);
router.delete("/userRoadmap", authUserMiddleware, checkRole("STUDENT"), deleteRoadmap);

// Teacher --- Student 
router.get("/teacher", authUserMiddleware, checkRole("STUDENT"), getAllTeacher);
router.get("/teacher/:specialization", authUserMiddleware, checkRole("STUDENT"), getSpecializationTeacher);

router.get("/student/teacher", authUserMiddleware, checkRole("STUDENT"), getTeachersOfStudent);
router.post("/student/teacher", authUserMiddleware, checkRole("STUDENT"), addTeacherToStudent);

router.post("/student/teacher/notification", authUserMiddleware, checkRole("STUDENT"), sendNotificationToTeacher);
router.get("/student/teacher/notification", authUserMiddleware, checkRole("TEACHER"), getTeacherNotifications);

// Admin routes
router.post("/admin", createAdmin);
router.get("/admin", authUserMiddleware, checkRole("ADMIN"), getAllUsers);
router.patch("/admin/:id", authUserMiddleware, checkRole("ADMIN"), updateUserByAdmin);
router.delete("/admin/:id", authUserMiddleware, checkRole("ADMIN"), deleteUserByAdmin);

module.exports = router;
