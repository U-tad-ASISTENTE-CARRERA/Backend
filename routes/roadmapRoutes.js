const express = require("express");
const router = express.Router();
const {
    createRoadmap,
    getAllRoadmaps,
    getRoadmapByName,
    updateRoadmap,
    deleteRoadmap,
    updateRoadmapBodyContent,
    deleteRoadmapBodyContent
} = require("../controllers/roadmapController");
const { validateRoadmap, validateRoadmapBody } = require("../validators/roadmapValidator");
const { authUserMiddleware, checkRole } = require("../middlewares/auth");
const { upload } = require("../utils/handleupload");


// Admin routes 
router.post("/", authUserMiddleware, checkRole("ADMIN"), upload.single("file"), createRoadmap);
router.get("/", authUserMiddleware, checkRole("ADMIN"), getAllRoadmaps);
router.get("/:name", authUserMiddleware, checkRole("ADMIN"), getRoadmapByName);
router.patch("/:name", authUserMiddleware, checkRole("ADMIN"), updateRoadmap);
router.patch("/:name/body", authUserMiddleware, checkRole("ADMIN"), updateRoadmapBodyContent);
router.delete("/:name", authUserMiddleware, checkRole("ADMIN"), deleteRoadmap);
router.delete("/:name/body", authUserMiddleware, checkRole("ADMIN"), deleteRoadmapBodyContent);

// Student routes 
router.get("/student/:name", authUserMiddleware, checkRole("STUDENT"), getRoadmapByName);

module.exports = router;
