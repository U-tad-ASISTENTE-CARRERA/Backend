const { db } = require("../config/firebase");

class User {
  constructor(email, password, seedWord = '123', role, metadata = {}) {
    this.email = email;
    this.password = password;
    this.role = role;
    this.seedWord = seedWord;
    this.metadata = metadata;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  async save() {
    const newUserRef = db.collection("users").doc(); 
    this.id = newUserRef.id;
    await newUserRef.set({ id: this.id, ...this });

    return { id: this.id, ...this };
  }
  
  static async findAll() {  
    const querySnapshot = await db.collection("users").get();
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data());
    });
    return users;
  }

  static async findById(id) {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) throw new Error("User not found");
    return doc.data();
  }

  static async findByEmail(email) {
    const querySnapshot = await db.collection("users").where("email", "==", email).get();
    if (querySnapshot.empty) throw new Error("User with this email not found");
    return querySnapshot.docs[0].data();
  }

  static async findByRole(role) {
    const querySnapshot = await db.collection("users").where("role", "==", role).get();
    if (querySnapshot.empty) throw new Error("User with this role not found");
    return querySnapshot.docs[0].data();
  }

  static async update(id, data) {
    data.updatedAt = new Date().toISOString();
    const userRef = db.collection("users").doc(id);
    await userRef.update(data);
    return { id, ...data };
  }

  static async updateMetadata(id, metadataUpdates) {
    const userRef = db.collection("users").doc(id);
    await userRef.update({
      "metadata": admin.firestore.FieldValue.merge(metadataUpdates),
      "updatedAt": new Date().toISOString()
    });
    return { id, updatedFields: metadataUpdates };
  }

  static async updateMultiMetadata(id, metadataUpdates) {
    const userRef = db.collection("users").doc(id);
    let updates = {};
    
    for (const key in metadataUpdates) updates[`metadata.${key}`] = metadataUpdates[key];
    
    updates.updatedAt = new Date().toISOString();
    await userRef.update(updates);
    return { id, updatedFields: metadataUpdates };
  }

  static async delete(id) {
    await db.collection("users").doc(id).delete();
    return { message: "User deleted", id };
  }
}

module.exports = User;