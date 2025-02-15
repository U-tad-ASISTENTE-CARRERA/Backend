const { db } = require("../config/firebase");

class Degree {
  constructor(name, subjects = []) {
    this.name = name;
    this.subjects = subjects;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  async save() {
    const newDegreeRef = db.collection("degrees").doc();
    this.id = newDegreeRef.id;
    await newDegreeRef.set({ id: this.id, ...this });
    return { id: this.id, ...this };
  }

  static async findAll() {
    const querySnapshot = await db.collection("degrees").get();
    return querySnapshot.docs.map((doc) => doc.data());
  }

  static async findByName(name) {
    const querySnapshot = await db.collection("degrees").where("name", "==", name).get();
    if (querySnapshot.empty) throw new Error("Degree not found");
    return querySnapshot.docs.map((doc) => doc.data());
}

  static async findById(id) {
    const doc = await db.collection("degrees").doc(id).get();
    if (!doc.exists) throw new Error("Degree not found");
    return doc.data();
  }

  static async update(id, data) {
    data.updatedAt = new Date().toISOString();
    await db.collection("degrees").doc(id).update(data);
    return { id, ...data };
  }

  static async delete(id) {
    await db.collection("degrees").doc(id).delete();
    return { message: "Degree deleted", id };
  }

  static async addSubject(degreeId, subject) {
    const degreeRef = db.collection("degrees").doc(degreeId);
    const degree = await degreeRef.get();
    if (!degree.exists) throw new Error("Degree not found");

    subject.id = `${Date.now()}`;
    await degreeRef.update({
      subjects: admin.firestore.FieldValue.arrayUnion(subject),
      updatedAt: new Date().toISOString(),
    });

    return subject;
  }

  static async getSubjects(degreeId) {
    const degree = await db.collection("degrees").doc(degreeId).get();
    if (!degree.exists) throw new Error("Degree not found");
    return degree.data().subjects || [];
  }

  static async updateSubject(degreeId, subjectId, updatedSubject) {
    const degreeRef = db.collection("degrees").doc(degreeId);
    const degree = await degreeRef.get();
    if (!degree.exists) throw new Error("Degree not found");

    const subjects = degree.data().subjects || [];
    const subjectIndex = subjects.findIndex((sub) => sub.id === subjectId);
    if (subjectIndex === -1) throw new Error("Subject not found");

    subjects[subjectIndex] = { ...subjects[subjectIndex], ...updatedSubject, updatedAt: new Date().toISOString() };

    await degreeRef.update({ subjects, updatedAt: new Date().toISOString() });

    return subjects[subjectIndex];
  }

  static async deleteSubject(degreeId, subjectId) {
    const degreeRef = db.collection("degrees").doc(degreeId);
    const degree = await degreeRef.get();
    if (!degree.exists) throw new Error("Degree not found");

    const subjects = degree.data().subjects || [];
    const updatedSubjects = subjects.filter((sub) => sub.id !== subjectId);

    await degreeRef.update({ subjects: updatedSubjects, updatedAt: new Date().toISOString() });

    return { message: "Subject deleted", id: subjectId };
  }
}

module.exports = Degree;