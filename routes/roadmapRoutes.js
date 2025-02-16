const express = require("express");
const router = express.Router();
const {
    createRoadmap,
    createRoadmaps,
    getAllRoadmaps,
    getRoadmapByLabelWithRecommended,
    getRoadmapByYear,
    getRoadmapByMention,
    updateRoadmap,
    deleteRoadmap
} = require("../controllers/roadmapController");
const { validateRoadmap } = require("../validators/roadmapValidator");
const { authUserMiddleware, checkRole } = require("../middlewares/auth");

// Admin routes 
router.post("/", authUserMiddleware, checkRole("ADMIN"), validateRoadmap, createRoadmap);
router.post("/many", authUserMiddleware, checkRole("ADMIN"), createRoadmaps);
router.patch("/roadmaps/:roadmapId", authUserMiddleware, checkRole("ADMIN"), validateRoadmap, updateRoadmap);
router.delete("/roadmaps/:roadmapId", authUserMiddleware, checkRole("ADMIN"), deleteRoadmap);

// Student routes
router.get("/", getAllRoadmaps);
router.get("/label/:label", authUserMiddleware, checkRole("STUDENT"), getRoadmapByLabelWithRecommended);
router.get("/year/:year", authUserMiddleware, checkRole("STUDENT"), getRoadmapByYear);
router.get("/mention/:mention", authUserMiddleware, checkRole("STUDENT"), getRoadmapByMention);

module.exports = router;
