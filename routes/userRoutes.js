const express = require("express");
const {
  registerUser,
  loginUser,
  resetPassword,
  updatePassword,
  logoutUser,
  createAdminWithoutValidation,
  updateUserRole,
  getUserRole,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfileHistory,
  uploadResume,
  updateAcademicHistory,
  getCareerAcademicHistory,
  getCareerRecommendations,
  getMissingRequirements,
  getSuggestedCourses,
  getMissingDataNotifications,
  updateRecommendationsOnChange,
  getProgress,
  getProfessionalRoadmap,
  getAchievements,
  getUserDashboard,
  getHistoricalProgress,
  notifyMilestoneCompletion,
  shareReport,
  getActivityMetrics,
  getStudentReports,
  generateReportPDF,
  getMarketJobs,
  getCareerPositions,
  scrapeJobMarketData,
  syncAcademicData,
  getAPIDocumentation,
} = require('../controllers/userController'); 

const { authUserMiddleware, checkRole } = require("../middlewares/auth");
const {
  validateUser,
  validateLogin,
  validateUserId,
  validateAcademicHistoryUpdate,
  validatePagination,
  validateRoleUpdate,
} = require("../validators/userValidator");

const router = express.Router();
// Autenticación y Gestión de Sesiones
router.post("/login", validateLogin, loginUser);
router.post("/register", validateUser, registerUser);
router.post("/password/reset", resetPassword);
router.post("/password/update", authUserMiddleware, updatePassword);
router.post("/auth/logout", authUserMiddleware, logoutUser);

// Gestión de Roles
router.patch("/:id/role", authUserMiddleware, checkRole(["ADMIN"]), validateRoleUpdate, updateUserRole);
router.get("/:id/role", authUserMiddleware, checkRole(["ADMIN"]), getUserRole);

// Gestión de Usuarios (CRUD)
router.get("/:id", authUserMiddleware, validateUserId, getUserById);
router.get("/", authUserMiddleware, checkRole(["ADMIN"]), validatePagination, getAllUsers);
router.patch("/:id", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateUserId, updateUser);
router.delete("/:id", authUserMiddleware, checkRole(["ADMIN"]), validateUserId, deleteUser);
router.get("/:id/history", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateUserId, getProfileHistory);
router.post("/:id/uploadResume", authUserMiddleware, checkRole(["STUDENT"]), uploadResume);

// Datos Académicos y Experiencia
router.patch("/:id/academicHistory", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateAcademicHistoryUpdate, updateAcademicHistory);
router.get("/:id/academicHistory", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateUserId, getCareerAcademicHistory);

// Recomendaciones y Ajustes en Tiempo Real
router.get("/:id/recommendations", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateUserId, getCareerRecommendations);
router.get("/:id/missingRequirements", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getMissingRequirements);
router.get("/:id/suggestedCourses", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getSuggestedCourses);
router.get("/:id/missingDataNotifications", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getMissingDataNotifications);
router.post("/:id/recommendations/update", authUserMiddleware, checkRole(["STUDENT"]), updateRecommendationsOnChange);

// Seguimiento del Progreso
router.get("/:id/progress", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getProgress);
router.get("/:id/professionalRoadmap", authUserMiddleware, checkRole(["STUDENT", "ADMIN"]), validateUserId, getProfessionalRoadmap);
router.get("/:id/achievements", authUserMiddleware, checkRole(["STUDENT", "ADMIN"]), validateUserId, getAchievements);
router.get("/:id/dashboard", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getUserDashboard);
router.get("/:id/historicalProgress", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, getHistoricalProgress);
router.post("/:id/achievements/notify", authUserMiddleware, checkRole(["STUDENT"]), notifyMilestoneCompletion);

// Generación de Reportes
router.post("/:id/shareReport", authUserMiddleware, checkRole(["STUDENT"]), shareReport);
router.get("/:id/activityMetrics", authUserMiddleware, checkRole(["STUDENT", "ADMIN"]), validateUserId, getActivityMetrics);
router.get("/teachers/:id/studentReports", authUserMiddleware, checkRole(["TEACHER"]), getStudentReports);
router.post("/:id/studentReports/pdf", authUserMiddleware, checkRole(["TEACHER"]), generateReportPDF);
router.get("/students/reports", authUserMiddleware, checkRole(["TEACHER", "ADMIN"]), getStudentReports);

// Integraciones con Sistemas Externos
router.get("/market/jobs", authUserMiddleware, checkRole(["STUDENT", "ADMIN"]), getMarketJobs);
router.get("/market/positions/:career", authUserMiddleware, checkRole(["STUDENT", "ADMIN"]), getCareerPositions);
router.post("/market/scrapeJobs", authUserMiddleware, checkRole(["ADMIN"]), scrapeJobMarketData);
router.get("/sync/academicData", authUserMiddleware, checkRole(["ADMIN"]), syncAcademicData);
router.get("/api/documentation", getAPIDocumentation);

// Configuración Inicial (Admin)
router.post("/setup/admin", createAdminWithoutValidation);

module.exports = router;
