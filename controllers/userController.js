const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userSnapshot = await db.collection("users").where("email", "==", email).get();

    if (userSnapshot.empty) {
      return handleHttpError(res, "INVALID_CREDENTIALS", 401);
    }

    const user = userSnapshot.docs[0].data();
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return handleHttpError(res, "INVALID_CREDENTIALS", 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({ message: "LOGIN_SUCCESS", token, user: { ...user, password: undefined } });
  } catch (error) {
    console.error("Login Error:", error.message);
    return handleHttpError(res, "ERROR_LOGGING_IN", 500);
  }
};

const createAdminWithoutValidation = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash("AdminPass123", 10);
    const userRef = db.collection("users").doc();
    const adminUser = {
      id: userRef.id,
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "ADMIN",
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(adminUser);

    const token = generateToken({ id: adminUser.id, role: adminUser.role });

    res.status(201).json({ message: "Admin user created", userId: userRef.id, token });
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    return handleHttpError(res, "ERROR_CREATING_ADMIN", 500);
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, metadata } = req.body;
    const existingUser = await db.collection("users").where("email", "==", email).get();

    if (!existingUser.empty) return handleHttpError(res, "User already exists", 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = db.collection("users").doc();
    const newUser = {
      id: userRef.id,
      name,
      email,
      password: hashedPassword,
      role,
      metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(newUser);
    res.status(201).json({ message: "User created successfully", user: { ...newUser, password: undefined } });
  } catch (error) {
    handleHttpError(res, "Error creating user", 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) return handleHttpError(res, "User not found", 404);

    const user = userDoc.data();
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    handleHttpError(res, "Error retrieving user", 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const usersRef = await db.collection("users").offset(offset).limit(parseInt(limit)).get();
    const users = usersRef.docs.map((doc) => ({ id: doc.id, ...doc.data(), password: undefined }));

    res.json({ users });
  } catch (error) {
    handleHttpError(res, "Error retrieving users", 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date().toISOString();

    await db.collection("users").doc(id).update(updateData);
    res.json({ message: "User updated successfully", data: updateData });
  } catch (error) {
    handleHttpError(res, "Error updating user", 500);
  }
};

const updateAcademicHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, grade } = req.body;

    const userRef = db.collection("users").doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return handleHttpError(res, "User not found", 404);

    const user = userDoc.data();
    if (user.role !== "STUDENT") return handleHttpError(res, "Only students have academic history", 403);

    const updatedHistory = { ...user.metadata.academicHistory, [subject]: parseFloat(grade.toFixed(2)) };
    await userRef.update({ "metadata.academicHistory": updatedHistory, updatedAt: new Date().toISOString() });

    res.json({ message: "Academic history updated", updatedHistory });
  } catch (error) {
    handleHttpError(res, "Error updating academic history", 500);
  }
};

const getCareerAcademicHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) return handleHttpError(res, "User not found", 404);

    const user = userDoc.data();
    if (user.role !== "STUDENT") return handleHttpError(res, "Only students receive recommendations", 403);

    res.json({ academicHistory: user.metadata.academicHistory || [] });
  } catch (error) {
    handleHttpError(res, "Error retrieving recommendations", 500);
  }
};

const getCareerRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("users").doc(id).get();

    if (!userDoc.exists) return handleHttpError(res, "User not found", 404);

    const user = userDoc.data();
    if (user.role !== "STUDENT") return handleHttpError(res, "Only students receive recommendations", 403);

    res.json({ recommendations: user.metadata.recommendations || [] });
  } catch (error) {
    handleHttpError(res, "Error retrieving recommendations", 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ message: "User deleted successfully", id });
  } catch (error) {
    handleHttpError(res, "Error deleting user", 500);
  }
};

module.exports = {
  loginUser,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  updateAcademicHistory,
  getCareerRecommendations,
  deleteUser,
  getCareerAcademicHistory,
  createAdminWithoutValidation,
};