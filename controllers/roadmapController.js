const fs = require("fs/promises");
const Roadmap = require("../models/Roadmap");
const path = require("path");
const Joi = require("joi");
const multer = require("multer");

const roadmapSchema = Joi.object({
  roadmap: Joi.object({
    name: Joi.string().required(),
    body: Joi.object().required(),
  }).required(),
});

const createRoadmap = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const filePath = req.file.path;
    const data = await fs.readFile(filePath, "utf8");

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (jsonError) {
      return res.status(400).json({ error: "Invalid JSON format", details: jsonError.message });
    }

    if (!parsedData.roadmap) return res.status(400).json({ error: "Roadmap object is missing in JSON" });
    const { name, body } = parsedData.roadmap;
    try {
      await Roadmap.findByName(name);
      return res.status(409).json({ error: "Roadmap already exists" });
    } catch (err) {
      if (err.message !== "Roadmap not found") {
        return res.status(500).json({ error: err.message });
      }
    }

    const roadmap = new Roadmap(name, body);
    const savedRoadmap = await roadmap.save();
    await fs.unlink(filePath);
    res.status(201).json({ message: "Roadmap saved successfully", ...savedRoadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.findAll();
    res.status(200).json(roadmaps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoadmapByName = async (req, res) => {
  try {
    const { name } = req.params;
    const roadmap = await Roadmap.findByName(name);
    res.status(200).json(roadmap);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateRoadmap = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedRoadmap = req.body;
    const roadmap = await Roadmap.updateByName(name, updatedRoadmap);
    res.status(200).json({ message: "Roadmap updated successfully", ...roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoadmap = async (req, res) => {
  try {
    const { name } = req.params;
    const result = await Roadmap.deleteByName(name);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRoadmapBodyContent = async (req, res) => {
  try {
    const { name } = req.params;
    const { field, updates } = req.body;

    if (!field || !updates) return res.status(400).json({ error: "Field name and updates are required" });
    
    const roadmap = await Roadmap.findByName(name);
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
    if (!roadmap.body[field]) return res.status(400).json({ error: "Field does not exist in roadmap body" });
    
    roadmap.body[field] = { ...roadmap.body[field], ...updates };
    roadmap.updatedAt = new Date().toISOString();
    await Roadmap.updateByName(name, roadmap);

    res.status(200).json({ message: "Roadmap body updated successfully", ...roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoadmapBodyContent = async (req, res) => {
  try {
    const { name } = req.params;
    const { field } = req.body;
    if (!field) return res.status(400).json({ error: "Field name is required for deletion" });

    const roadmap = await Roadmap.findByName(name);
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });
    if (!roadmap.body[field]) return res.status(400).json({ error: "Field does not exist in roadmap body" });
    
    delete roadmap.body[field];
    roadmap.updatedAt = new Date().toISOString();
    await Roadmap.updateByName(name, roadmap);

    res.status(200).json({ message: "Roadmap body content deleted successfully", ...roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  createRoadmap, 
  getAllRoadmaps,
  getRoadmapByName, 
  updateRoadmap, 
  deleteRoadmap, 
  updateRoadmapBodyContent, 
  deleteRoadmapBodyContent 
};
