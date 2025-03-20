const { db } = require("../config/firebase");

class Degree {
  constructor(name, subjects = []) {
    this.degree = {
      name,
      subjects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async save() {
    const degreeRef = db.collection("degrees").doc(this.degree.name);
    await degreeRef.set(this.degree);
    return { id: degreeRef.id, ...this.degree };
  }

  static async findAll() {
    const querySnapshot = await db.collection("degrees").get();
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  static async findByName(name) {
    const doc = await db.collection("degrees").doc(name).get();
    if (!doc.exists) throw new Error("Degree not found");
    return { id: doc.id, ...doc.data() };
  }
  
  static async update(name, data) {
    data.updatedAt = new Date().toISOString();
    await db.collection("degrees").doc(name).update(data);
    return { id: name, ...data };
  }

  static async delete(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Invalid degree name');
    }
  
    const trimmedName = name.trim();
  
    await db.collection("degrees").doc(trimmedName).delete();
    return { message: "Degree deleted", id: trimmedName };
  }
}

module.exports = Degree;