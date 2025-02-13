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

router.post("/", authUserMiddleware, checkRole("ADMIN"), validateRoadmap, createRoadmap);
router.post("/many", authUserMiddleware, checkRole("ADMIN"), createRoadmaps);
router.get("/", getAllRoadmaps);
router.get("/label/:label", authUserMiddleware, checkRole("ADMIN"), getRoadmapByLabelWithRecommended);
router.get("/year/:year", authUserMiddleware, checkRole("ADMIN"), getRoadmapByYear);
router.get("/mention/:mention", authUserMiddleware, checkRole("ADMIN"), getRoadmapByMention);
router.patch("/roadmaps/:roadmapId", authUserMiddleware, checkRole("ADMIN"), validateRoadmap, updateRoadmap);
router.delete("/roadmaps/:roadmapId", authUserMiddleware, checkRole("ADMIN"), deleteRoadmap);

module.exports = router;
