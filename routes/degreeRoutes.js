const express = require("express");
const router = express.Router();
const { 
    createDegree, 
    getAllDegrees, 
    getDegreeById, 
    updateDegree, 
    patchDegree, 
    deleteDegree,
    addSubjectToDegree,
    getSubjectsByDegree,
    getSubjectsById,
    updateSubjectInDegree,
    deleteSubjectFromDegree,
    searchSubjectsInDegree
} = require("../controllers/degreeController");
const { validateDegree, validateSubject } = require("../validators/degreeValidator");
const { authUserMiddleware, checkRole } = require("../middlewares/auth");

router.post("/", authUserMiddleware, checkRole("ADMIN"), validateDegree, createDegree);
router.get("/", authUserMiddleware, checkRole("ADMIN") ,getAllDegrees);
router.get("/:id", authUserMiddleware, checkRole("ADMIN"), getDegreeById);
router.patch("/:id", authUserMiddleware, checkRole("ADMIN"), validateDegree, updateDegree);
router.patch("/:id", authUserMiddleware, checkRole("ADMIN"), patchDegree);
router.delete("/:id", authUserMiddleware, checkRole("ADMIN"), deleteDegree);

router.post("/:id/subjects", authUserMiddleware, checkRole("ADMIN"), validateSubject, addSubjectToDegree);
router.get("/:id/subjects/:id", authUserMiddleware, checkRole("ADMIN"), getSubjectsByDegree);
router.get("/:id/subjects/:subjectId", authUserMiddleware, checkRole("ADMIN"), getSubjectsById);
router.patch("/:id/subjects/:subjectId", authUserMiddleware, checkRole("ADMIN"), validateSubject, updateSubjectInDegree);
router.delete("/:id/subjects/:subjectId", authUserMiddleware, checkRole("ADMIN"), deleteSubjectFromDegree);
router.get("/:id/subjects/search", authUserMiddleware, checkRole("ADMIN"), searchSubjectsInDegree);

// Student routes
router.get("/student/AH", authUserMiddleware, checkRole("STUDENT"), getSubjectsByDegree);

module.exports = router;