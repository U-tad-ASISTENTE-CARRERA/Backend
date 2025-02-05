const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
const { upload, parseResume } = require("../utils/pdfToJson");
const User = require("../models/User");

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const userSnapshot = await db.collection("users").where("email", "==", email).get();

//     if (userSnapshot.empty) {
//       return handleHttpError(res, "INVALID_CREDENTIALS", 401);
//     }

//     const user = userSnapshot.docs[0].data();
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return handleHttpError(res, "INVALID_CREDENTIALS", 401);
//     }

//     const token = generateToken({ id: user.id, role: user.role });

//     res.json({ message: "LOGIN_SUCCESS", token, user: { ...user, password: undefined } });
//   } catch (error) {
//     console.error("Login Error:", error.message);
//     return handleHttpError(res, "ERROR_LOGGING_IN", 500);
//   }
// };

// const createAdminWithoutValidation = async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash("AdminPass123", 10);
//     const userRef = db.collection("users").doc();
//     const adminUser = {
//       id: userRef.id,
//       name: "Admin User",
//       email: "admin@example.com",
//       password: hashedPassword,
//       role: "ADMIN",
//       metadata: {},
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     await userRef.set(adminUser);

//     const token = generateToken({ id: adminUser.id, role: adminUser.role });

//     res.status(201).json({ message: "Admin user created", userId: userRef.id, token });
//   } catch (error) {
//     console.error("Error creating admin user:", error.message);
//     return handleHttpError(res, "ERROR_CREATING_ADMIN", 500);
//   }
// };

// Autenticación y Gestión de Sesioness
const registerUser = async (req, res) => {};
const loginUser = async (req, res) => {};
const resetPassword = async (req, res) => {};
const updatePassword = async (req, res) => {};
const logoutUser = async (req, res) => {};
const createAdminWithoutValidation = async (req, res) => {};

// Gestión de Roles
const updateUserRole = async (req, res) => {};
const getUserRole = async (req, res) => {};

// Gestión de Usuarios (CRUD)
const getUserById = async (req, res) => {};
const getUserByRole = async (req, res) => {};
const getUserByEmail = async (req, res) => {};
const getAllUsers = async (req, res) => {};
const updateUser = async (req, res) => {};
const deleteUser = async (req, res) => {};
const getProfileHistory = async (req, res) => {};
const uploadResume = async (req, res) => {};

// Datos Académicos y Experiencia
const updateAcademicHistory = async (req, res) => {};
const getCareerAcademicHistory = async (req, res) => {};

// Recomendaciones y Ajustes en Tiempo Real
const getCareerRecommendations = async (req, res) => {};
const getMissingRequirements = async (req, res) => {};
const getSuggestedCourses = async (req, res) => {};
const getMissingDataNotifications = async (req, res) => {};
const updateRecommendationsOnChange = async (req, res) => {};

// Seguimiento del Progreso
const getProgress = async (req, res) => {};
const getProfessionalRoadmap = async (req, res) => {};
const getAchievements = async (req, res) => {};
const getUserDashboard = async (req, res) => {};
const getHistoricalProgress = async (req, res) => {};
const notifyMilestoneCompletion = async (req, res) => {};

// Generación de Reportes
const shareReport = async (req, res) => {};
const getActivityMetrics = async (req, res) => {};
const getStudentReports = async (req, res) => {};
const generateReportPDF = async (req, res) => {};

// Integraciones con Sistemas Externos
const getMarketJobs = async (req, res) => {};
const getCareerPositions = async (req, res) => {};
const scrapeJobMarketData = async (req, res) => {};
const syncAcademicData = async (req, res) => {};
const getAPIDocumentation = async (req, res) => {};

module.exports = {
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
};
