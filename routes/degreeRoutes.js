const express = require("express");
const router = express.Router();
const { authUserMiddleware, checkRole } = require("../middlewares/auth");
const { validateSubject } = require("../validators/degreeValidator");
const { 
    createDegree, 
    getAllDegrees, 
    getDegreeByName, 
    updateDegree, 
    deleteDegree, 
    updateSubjects, 
    deleteSubjects 
} = require("../controllers/degreeController");
const { upload } = require("../utils/handleupload");

router.post("/", authUserMiddleware, checkRole("ADMIN"), upload.single("file"), createDegree);
router.get("/", authUserMiddleware, checkRole("ADMIN"), getAllDegrees);
router.get("/:name", authUserMiddleware, checkRole("STUDENT" || "ADMIN"), getDegreeByName);
router.delete("/:name", authUserMiddleware, checkRole("ADMIN"), deleteDegree);
router.patch("/:name", authUserMiddleware, checkRole("ADMIN"), updateDegree);
router.patch("/subjects/:name", authUserMiddleware, checkRole("ADMIN"), validateSubject, updateSubjects);
router.delete("/subjects/:name", authUserMiddleware, checkRole("ADMIN"), deleteSubjects);

module.exports = router;