const express = require("express");
const userRoutes = require("./userRoutes");
const degreeRoutes = require("./degreeRoutes");
const roadmapRoutes = require("./roadmapRoutes");

const router = express.Router();

router.use("/", userRoutes); 
router.use("/degrees", degreeRoutes);
router.use("/roadmaps", roadmapRoutes);

module.exports = router;