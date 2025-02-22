const { db } = require("../config/firebase");

class Roadmap {
    constructor(name, body) {
        this.name = name;
        this.body = body;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    async save() {
        const newRoadmapRef = db.collection("roadmaps").doc(this.name);
        await newRoadmapRef.set({ name: this.name, ...this });
        return { name: this.name, ...this };
    }

    static async findAll() {
        const querySnapshot = await db.collection("roadmaps").get();
        return querySnapshot.docs.map((doc) => doc.data());
    }

    static async findByName(name) {
        const docRef = db.collection("roadmaps").doc(name);
        const docSnap = await docRef.get();
        if (!docSnap.exists) throw new Error("Roadmap not found");
        return docSnap.data();
    }

    static async updateByName(name, updatedRoadmap) {
        const docRef = db.collection("roadmaps").doc(name);
        const docSnap = await docRef.get();
        if (!docSnap.exists) throw new Error("Roadmap not found");
    
        updatedRoadmap.updatedAt = new Date().toISOString();
        await docRef.update(updatedRoadmap);
    
        return { name, ...updatedRoadmap };
    }

    static async deleteByName(name) {
        const docRef = db.collection("roadmaps").doc(name);
        const docSnap = await docRef.get();
        if (!docSnap.exists) throw new Error("Roadmap not found");
    
        await docRef.delete();
        return { message: "Roadmap deleted", name };
    }
}

module.exports = Roadmap;
