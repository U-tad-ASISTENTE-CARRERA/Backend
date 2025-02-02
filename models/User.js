const { db } = require("../config/firebase");
/**
 * ==============================================
 * COMMON USER FIELDS (All Users)
 * ==============================================
 * | Field          | Type        | Description |
 * |---------------|------------|-------------|
 * | `id`          | `string`    | Unique user ID (Firestore document ID) |
 * | `name`        | `string`    | Full name of the user |
 * | `email`       | `string`    | Institutional email address |
 * | `role`        | `string`    | User role (`STUDENT`, `TEACHER`, `ADMIN`) |
 * | `createdAt`   | `string (ISO)` | Timestamp of user creation |
 * | `updatedAt`   | `string (ISO)` | Last update timestamp |
 * | `metadata`    | `object`    | Additional dynamic data (varies by role) |
 *
 * ==============================================
 * STUDENT METADATA (`STUDENT`)
 * ==============================================
 * | Field              | Type        | Description |
 * |--------------------|------------|-------------|
 * | `academicHistory`  | `object`    | Subjects and grades (0-10, two decimal places) |
 * | `specialization`   | `string`    | Engineering specialization (e.g., Data Science, AI) |
 * | `recommendations`  | `array`     | Personalized career recommendations |
 * | `progressIndicators` | `object` | Progress tracking metrics |
 * | `careerGoal`       | `string`    | Desired career path |
 * | `academicReports`  | `array`     | Reports shared with professors |
 *
 * ==============================================
 * TEACHER METADATA (`TEACHER`)
 * ==============================================
 * | Field            | Type      | Description |
 * |----------------|----------|-------------|
 * | `department`   | `string`  | Department the teacher belongs to |
 * | `assignedGroups` | `array` | List of student groups they oversee |
 * | `statisticsAccess` | `boolean` | Whether they can view student statistics |
 *
 * ==============================================
 * ADMIN METADATA (`ADMIN`)
 * ==============================================
 * | Field              | Type      | Description |
 * |--------------------|----------|-------------|
 * | `systemPermissions` | `array`  | List of system permissions (`["manage_users", "edit_settings"]`) |
 * | `auditLogsAccess`  | `boolean` | Whether the admin can view logs |
 *
 * ==============================================
 * ROLE-BASED ACCESS CONTROL
 * ==============================================
 * 
 * | Action                       `STUDENT`   `TEACHER`   `ADMIN` 
 * |-------------------------------------------------------------
 * | View own profile                 ✅          ✅          ✅ 
 * | Update own profile               ✅          ✅          ✅ 
 * | View student academic history    ❌          ✅          ✅
 * | Update student academic history  ❌          ✅          ✅
 * | Manage user accounts             ❌          ❌          ✅
 * | Update system settings           ❌          ❌          ✅ 
 * | View audit logs                  ❌          ❌          ✅
 *
 * */

class User {
  constructor(name, email, role = "STUDENT", metadata = {}) {
    this.name = name;
    this.email = email;
    this.role = role;
    this.metadata = metadata;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  async save() {
    const userRef = db.collection("users").doc();
    this.id = userRef.id;
    await userRef.set({ id: this.id, ...this });
    return { id: this.id, ...this };
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

  static async update(id, data) {
    data.updatedAt = new Date().toISOString();
    const userRef = db.collection("users").doc(id);
    await userRef.update(data);
    return { id, ...data };
  }

  static async delete(id) {
    await db.collection("users").doc(id).delete();
    return { message: "User deleted", id };
  }

  static async updateAcademicHistory(id, subject, grade) {
    if (grade < 0 || grade > 10) throw new Error("Grade must be between 0 and 10");
    
    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error("User not found");

    const userData = userDoc.data();
    if (userData.role !== "STUDENT") throw new Error("Only students have academic history");

    const updatedHistory = { ...userData.metadata.academicHistory, [subject]: parseFloat(grade.toFixed(2)) };
    await userRef.update({ "metadata.academicHistory": updatedHistory, updatedAt: new Date().toISOString() });

    return { message: "Academic history updated", updatedHistory };
  }
}

module.exports = User;