const {db} = require("../config/firebase");

class Roadmap {
    constructor(name, description, label, recommendedLabels, link, year, mention) {
        this.name = name; // string
        this.description = description; // string
        this.label = label; // array string
        this.recommendedLabels = recommendedLabels; // array string
        this.link = link; // string
        this.year = year; // integer
        this.mention = mention; // string 
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    async save() {
        const newRoadmapRef = db.collection("roadmaps").doc();
        this.id = newRoadmapRef.id;
        await newRoadmapRef.set({id: this.id, ...this});
        return {id: this.id, ...this};
    }

    static async findAll() {
        const querySnapshot = await db.collection("roadmaps").get();
        return querySnapshot.docs.map((doc) => doc.data());
    }

    static async findById(id) {
        const doc = await db.collection("roadmaps").doc(id).get();
        if (!doc.exists) throw new Error("Roadmap not found");
        return doc.data();
    }

    static async findByLabel(label) {
        const querySnapshot = await db.collection("roadmaps").where("label", "==", label).get();
        return querySnapshot.docs.map((doc) => doc.data());
    }

    static async findByLabelWithRecommended(label) {
        const querySnapshot = await db.collection("roadmaps").where("label", "==", label).get();
        const querySnapshot2 = await db.collection("roadmaps").where("recommendedLabels", "==", label).get();
        return querySnapshot.docs.map((doc) => doc.data()).concat(querySnapshot2.docs.map((doc) => doc.data()));        
    }

    static async findByYear(year) {
        const querySnapshot = await db.collection("roadmaps").where("year", "==", year).get();
        return querySnapshot.docs.map((doc) => doc.data());
    }

    static async findByMention(mention) {
        const querySnapshot = await db.collection("roadmaps").where("mention", "==", mention).get();
        return querySnapshot.docs.map((doc) => doc.data());
    }

    static async updateRoadmap(roadmapId, updatedRoadmap) {
        const roadmapRef = db.collection("roadmaps").doc(roadmapId);
        const roadmap = await roadmapRef.get();
        if (!roadmap.exists) throw new Error("Roadmap not found");
    
        updatedRoadmap.updatedAt = new Date().toISOString();
        await roadmapRef.update(updatedRoadmap);
    
        return { id: roadmapId, ...updatedRoadmap };
    }

    static async deleteRoadmap(roadmapId) {
        const roadmapRef = db.collection("roadmaps").doc(roadmapId);
        const roadmap = await roadmapRef.get();
        if (!roadmap.exists) throw new Error("Roadmap not found");
    
        await roadmapRef.delete();
        return { message: "Roadmap deleted", id: roadmapId };
    }

    static async 
}

module.exports = Roadmap;