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
    deleteTeacherFromStudent,
    getTeachersOfStudent,
    sendNotificationToTeacher,
    getTeacherNotifications,
    updateNotificationStatus,
    getAllTeacher,
    getAllStudentsOfTeacher,
    getSpecializationTeacher,
    getTeacherNotificationsByStudent,
    markAllNotificationsAsRead,
    deleteNotification,
    getStudent,
    createAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
    getStudentByTeacher,
    sendDeletionRequest,
    cancelDeletionRequest,
    getDeletionRequests,
    generateSummary, 
    getLatestSummary, 
    getAllSummaries,
    getStudentAllSummaries,
    getStudentLatestSummary,
    deleteSummaryById,
    getUpdateHistory
} = require("../controllers/userController");

const { 
    validateUser, 
    validateLogin, 
    validateNewPassword, 
    validateMetadata 
} = require("../validators/userValidator");

const { authUserMiddleware, checkRole } = require("../middlewares/auth");
const { ro } = require("date-fns/locale");

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
router.delete("/student/teacher", authUserMiddleware, checkRole("STUDENT"), deleteTeacherFromStudent);

router.get("/student/teacher/notification", authUserMiddleware, checkRole("TEACHER"), getTeacherNotifications);
router.get("/student/teacher/notification/byStudent", authUserMiddleware, checkRole("TEACHER"), getTeacherNotificationsByStudent);
router.post("/student/teacher/notification", authUserMiddleware, checkRole("STUDENT"), sendNotificationToTeacher);
router.patch("/student/teacher/notification", authUserMiddleware, checkRole("TEACHER"), updateNotificationStatus);
router.post("/student/teacher/notification/read-all", authUserMiddleware, checkRole("TEACHER"), markAllNotificationsAsRead);
router.delete("/student/teacher/notification/:notificationId", authUserMiddleware, checkRole("TEACHER"), deleteNotification);

router.get("/student/teacher/getAllStudents", authUserMiddleware, checkRole("TEACHER"), getAllStudentsOfTeacher);
router.get("/student/teacher/getStudent", authUserMiddleware, checkRole("TEACHER"), getStudentByTeacher);

// Admin routes
router.post("/admin", createAdmin);
router.get("/admin", authUserMiddleware, checkRole("ADMIN"), getAllUsers);
router.get("/admin/student", authUserMiddleware, checkRole("ADMIN"), getStudent);
router.patch("/admin/:id", authUserMiddleware, checkRole("ADMIN"), updateUserByAdmin);
router.delete("/admin/:id", authUserMiddleware, checkRole("ADMIN"), deleteUserByAdmin);

// Deletion Request routes
router.post("/deletionRequest", authUserMiddleware, checkRole(["STUDENT", "TEACHER"]), sendDeletionRequest);
router.delete("/deletionRequest", authUserMiddleware, checkRole(["STUDENT", "TEACHER"]), cancelDeletionRequest);

router.get("/admin/deletionRequests", authUserMiddleware, checkRole(["ADMIN"]), getDeletionRequests);

// Summary routes
router.post("/summary", authUserMiddleware, checkRole("STUDENT"), generateSummary);

router.get("/summary", authUserMiddleware, checkRole("STUDENT"), getAllSummaries);
router.get("/summary/latest", authUserMiddleware, checkRole("STUDENT"), getLatestSummary);
router.delete("/summary/:summaryId", authUserMiddleware, checkRole("STUDENT"), deleteSummaryById);

router.get("/summary/:studentId/all", authUserMiddleware, checkRole("TEACHER"), getStudentAllSummaries);
router.get("/summary/:studentId/latest", authUserMiddleware, checkRole("TEACHER"), getStudentLatestSummary);

router.get("/updateHistory", authUserMiddleware, checkRole(["STUDENT", "TEACHER"]), getUpdateHistory);

module.exports = router;
