const express = require("express");
const UserController = require("../controllers/userController");
const { authUserMiddleware, checkRole } = require("../middlewares/auth");
const {
  validateUser,
  validateLogin,
  validateUserId,
  validateAcademicHistoryUpdate,
  validatePagination,
} = require("../validators/userValidator");

const router = express.Router();

router.post("/login", validateLogin, UserController.loginUser);

router.post("/", authUserMiddleware, checkRole(["ADMIN"]), validateUser, UserController.createUser);
router.get("/:id", authUserMiddleware, validateUserId, UserController.getUserById);
router.get("/", authUserMiddleware, checkRole(["ADMIN"]), validatePagination, UserController.getAllUsers);
router.patch("/:id", authUserMiddleware, checkRole(["ADMIN", "STUDENT"]), validateUserId, UserController.updateUser);
router.delete("/:id", authUserMiddleware, checkRole(["ADMIN"]), validateUserId, UserController.deleteUser);

router.patch("/:id/academicHistory", authUserMiddleware, checkRole(["STUDENT"]), validateAcademicHistoryUpdate, UserController.updateAcademicHistory);
router.get("/:id/recommendations", authUserMiddleware, checkRole(["STUDENT"]), validateUserId, UserController.getCareerRecommendations);

router.post("/setup/admin", UserController.createAdminWithoutValidation);

module.exports = router;