const express = require("express");
const userRoutes = require("./userRoutes");
const degreeRoutes = require("./degreeRoutes");

const router = express.Router();

router.use("/", userRoutes); 
router.use("/degrees", degreeRoutes);

module.exports = router;