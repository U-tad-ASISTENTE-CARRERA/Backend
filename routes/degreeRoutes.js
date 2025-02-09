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
    updateSubjectInDegree,
    deleteSubjectFromDegree,
    searchSubjectsInDegree
} = require("../controllers/degreeController");
const { validateDegree, validateSubject } = require("../validators/degreeValidator");

router.post("/", validateDegree, createDegree);
router.get("/", getAllDegrees);
router.get("/:id", getDegreeById);
router.patch("/:id", validateDegree, updateDegree);
router.patch("/:id", patchDegree);
router.delete("/:id", deleteDegree);

router.post("/:id/subjects", validateSubject, addSubjectToDegree);
router.get("/:id/subjects", getSubjectsByDegree);
router.patch("/:id/subjects/:subjectId", validateSubject, updateSubjectInDegree);
router.delete("/:id/subjects/:subjectId", deleteSubjectFromDegree);
router.get("/:id/subjects/search", searchSubjectsInDegree);

module.exports = router;