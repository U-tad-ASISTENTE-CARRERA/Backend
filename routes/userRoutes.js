const express = require("express");
const { registerUser, loginUser, updatePassword, logoutUser, getUserProfile, updateSeedWord } = require("../controllers/userController");
const { validateUser, valitdateLogin, validateNewPassword }= require("../validators/userValidator");
const { authUserMiddleware, checkRole } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", valitdateLogin, loginUser);
router.post("/register", validateUser, registerUser);
router.put("/updatePassword", authUserMiddleware, validateNewPassword, updatePassword);
router.post("/logout", authUserMiddleware, logoutUser);

router.get("/", authUserMiddleware, getUserProfile);
router.patch("/", authUserMiddleware, updateSeedWord);

module.exports = router;
