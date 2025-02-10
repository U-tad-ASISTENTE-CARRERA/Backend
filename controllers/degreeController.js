const Degree = require("../models/Degree");

const createDegree = async (req, res) => {
  try {
    const { name, subjects } = req.body;
    const newDegree = new Degree(name, subjects || []);
    const savedDegree = await newDegree.save();
    res.status(201).json(savedDegree);
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

const getDegreeById = async (req, res) => {
  try {
    const degree = await Degree.findById(req.params.id);
    res.status(200).json(degree);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateDegree = async (req, res) => {
  try {
    const updatedDegree = await Degree.update(req.params.id, req.body);
    res.status(200).json(updatedDegree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const patchDegree = async (req, res) => {
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

const addSubjectToDegree = async (req, res) => {
  try {
    const { subject } = req.body;
    const addedSubject = await Degree.addSubject(req.params.id, subject);
    res.status(201).json(addedSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubjectsByDegree = async (req, res) => {
  try {
    const subjects = await Degree.getSubjects(req.params.id);
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSubjectsById = async (req, res) => {
  try {
    const subject = await Degree.getSubjectById(req.params.id, req.params.subjectId);
    res.status(200).json(subject);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

const updateSubjectInDegree = async (req, res) => {
  try {
    const updatedSubject = await Degree.updateSubject(req.params.id, req.params.subjectId, req.body);
    res.status(200).json(updatedSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubjectFromDegree = async (req, res) => {
  try {
    const response = await Degree.deleteSubject(req.params.id, req.params.subjectId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchSubjectsInDegree = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.query;

    if (!field || !value) {
      return res.status(400).json({ error: "Both 'field' and 'value' parameters are required." });
    }

    const subjects = await Degree.getSubjects(id);
    const filteredSubjects = subjects.filter((subject) => String(subject[field]).toLowerCase().includes(value.toLowerCase()));

    res.status(200).json(filteredSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
  searchSubjectsInDegree,
};