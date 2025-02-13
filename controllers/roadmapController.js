const Roadmap = require("../models/Roadmap");
const { validationResult } = require("express-validator");

const createRoadmap = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const roadmap = new Roadmap(
            req.body.name,
            req.body.description,
            req.body.label,
            req.body.recommendedLabels,
            req.body.link,
            req.body.year,
            req.body.mention
        );
        const savedRoadmap = await roadmap.save();
        res.status(201).json(savedRoadmap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRoadmaps = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const roadmapsData = Array.isArray(req.body) ? req.body : [req.body];
        const savedRoadmaps = [];

        for (const roadmapData of roadmapsData) {
            const roadmap = new Roadmap(
                roadmapData.name,
                roadmapData.description,
                roadmapData.label || [],
                roadmapData.recommendedLabels || [],
                roadmapData.link,
                roadmapData.year,
                roadmapData.mention || ""
            );
            const savedRoadmap = await roadmap.save();
            savedRoadmaps.push(savedRoadmap);
        }

        res.status(201).json(savedRoadmaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.findAll();
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRoadmapByLabelWithRecommended = async (req, res) => {
    try {
        const { label } = req.params;
        const roadmaps = await Roadmap.findByLabelWithRecommended(label);
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRoadmapByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const roadmaps = await Roadmap.findByYear(parseInt(year));
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRoadmapByMention = async (req, res) => {
    try {
        const { mention } = req.params;
        const roadmaps = await Roadmap.findByMention(mention);
        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRoadmap = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { roadmapId } = req.params;
        const updatedRoadmap = await Roadmap.updateRoadmap(roadmapId, req.body);
        res.json(updatedRoadmap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRoadmap = async (req, res) => {
    try {
        const { roadmapId } = req.params;
        const result = await Roadmap.deleteRoadmap(roadmapId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRoadmap,
    createRoadmaps,
    getAllRoadmaps,
    getRoadmapByLabelWithRecommended,
    getRoadmapByYear,
    getRoadmapByMention,
    updateRoadmap,
    deleteRoadmap
};