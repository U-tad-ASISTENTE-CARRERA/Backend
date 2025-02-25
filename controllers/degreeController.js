const fs = require("fs/promises");
const Degree = require("../models/Degree");
const path = require("path");
const Joi = require("joi");
const db = require("../config/firebase");
const multer = require("multer");

const subjectSchema = Joi.object({
  mention: Joi.string().allow(""), 
  name: Joi.string().required(),
  credits: Joi.number().integer().positive().required(),
  label: Joi.string().allow("").required(), 
  type: Joi.string().valid("B", "OB", "OP", "OBM").required(),
  skills: Joi.array().items(Joi.string()).required(),
  year: Joi.number().integer().min(1).max(6).required(),
});

const degreeSchema = Joi.object({
  degree: Joi.object({
    name: Joi.string().required(),
    subjects: Joi.array().items(subjectSchema).min(1).required(),
  }).required(),
});

const createDegree = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const data = await fs.readFile(filePath, "utf8");

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (jsonError) {
      return res.status(400).json({ error: "Invalid JSON format", details: jsonError.message });
    }

    if (!parsedData.degree) {
      return res.status(400).json({ error: "Degree object is missing in JSON" });
    }

    const { name, subjects } = parsedData.degree;

    try {
      await Degree.findByName(name);
      return res.status(409).json({ error: "Degree already exists" });
    } catch (err) {
      if (err.message !== "Degree not found") {
        return res.status(500).json({ error: err.message });
      }
    }

    const degree = new Degree(name, subjects);
    const savedDegree = await degree.save();

    await fs.unlink(filePath);
    res.status(201).json({ message: "Degree saved successfully", ...savedDegree });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDegrees = async (req, res) => {
  try {
    const degrees = await Degree.findAll();
    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDegreeByName = async (req, res) => {
  try {
    const degree = await Degree.findByName(req.params.name);
    if (!degree) return res.status(404).json({ error: "Degree not found" });
    res.status(200).json(degree);
  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateDegree = async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);
    if (!degree) return res.status(404).json({ error: "Degree not found" });

    const updatedData = { ...degree, ...req.body, updatedAt: new Date().toISOString() };
    const updatedDegree = await Degree.update(req.params.id, updatedData);
    res.status(200).json(updatedDegree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDegree = async (req, res) => {
  try {
    const response = await Degree.delete(req.params.id);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSubjects = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedSubjects = req.body.subjects;

    if (!Array.isArray(updatedSubjects) || updatedSubjects.length === 0) {
      return res.status(400).json({ error: "Invalid subjects array" });
    }

    let degree;
    try {
      degree = await Degree.findByName(name);
    } catch (err) {
      return res.status(404).json({ error: "Degree not found" });
    }

    let subjects = degree.subjects || [];
    let subjectMap = new Map(subjects.map(subject => [subject.name, subject]));

    updatedSubjects.forEach(subjectUpdate => {
      if (subjectMap.has(subjectUpdate.name)) {
        subjectMap.set(subjectUpdate.name, {
          ...subjectMap.get(subjectUpdate.name),
          ...subjectUpdate,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    const newSubjects = Array.from(subjectMap.values());

    const updatedDegree = await Degree.update(name, { subjects: newSubjects });

    res.status(200).json({
      message: "Subjects updated successfully",
      updatedSubjects: updatedSubjects.map(subject => subject.name),
      degree: updatedDegree,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubjects = async (req, res) => {
  try {
    const { name } = req.params;
    const subjectsToDelete = req.body.subjects;

    if (!Array.isArray(subjectsToDelete) || subjectsToDelete.length === 0) {
      return res.status(400).json({ error: "Invalid subjects array" });
    }

    let degree;
    try {
      degree = await Degree.findByName(name);
    } catch (err) {
      return res.status(404).json({ error: "Degree not found" });
    }

    let subjects = degree.subjects || [];
    const remainingSubjects = subjects.filter(subject => !subjectsToDelete.includes(subject.name));
    const deletedSubjects = subjects.filter(subject => subjectsToDelete.includes(subject.name));

    if (deletedSubjects.length === 0) {
      return res.status(404).json({ error: "No matching subjects found for deletion" });
    }

    const updatedDegree = await Degree.update(name, { subjects: remainingSubjects });

    res.status(200).json({
      message: "Subjects deleted successfully",
      deletedSubjects: deletedSubjects.map(subject => subject.name),
      degree: updatedDegree,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDegree,
  getAllDegrees,
  getDegreeByName,
  updateDegree,
  deleteDegree,
  updateSubjects,
  deleteSubjects
};