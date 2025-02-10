const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
// const { sendEmail } = require("../utils/handleResend");
const { Resend } = require("resend");
const User = require("../models/User");
const e = require("express");
const admin = require("firebase-admin");

const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, content) => {
    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to,
            subject,
            html: content,
        });
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};
    
const registerUser = async (req, res) => {
    try {
        const { email, password, seedWord } = req.body;
        console.log(email, password, seedWord);
        try {
            await User.findByEmail(email);
            return handleHttpError(res, "USER_ALREADY_EXISTS", 400);
        } catch (error) {}

        const domain = email.split("@")[1];
        if (!domain) return handleHttpError(res, "INVALID_EMAIL", 400);    
        const role = domain === "live.u-tad.com" ? "STUDENT" : "TEACHER";

        const hashedPassword = await bcrypt.hash(password, 10);
    
        const newUser = new User(email, hashedPassword, seedWord, role);
        const savedUser = await newUser.save();

        const token = generateToken({email: savedUser.email, role: savedUser.role, seedWord: savedUser.seedWord });
        await sendEmail(
            email,
            "Bienvenido a la plataforma",
            `<h2>Hola ${email.split(".")[0]}</h2>
            <p>Tu cuenta ha sido creada con exito.</p>
            <p>Gracias por registrarte.</p>`
        );

        return res.status(201).json({ message: "USER_CREATED", token, user: { ...savedUser, password: undefined } });
    } catch (error) {
        console.error("Register User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user;
        try {
            user = await User.findByEmail(email);
        } catch (error) {
            return handleHttpError(res, "INVALID_CREDENTIALS", 401);
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return handleHttpError(res, "INVALID_CREDENTIALS", 401);

        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        return res.json({ message: "LOGIN_SUCCESS", token, user: { ...user, password : undefined} });
    } catch (error) {
        console.error("Login User Error:", error.message);
        return handleHttpError(res, error.message || "INTERNAL_SERVER_ERROR", 500);
    }
};

const logoutUser = async (req, res) => {
    try {
        return res.status(200).json({ message: "LOGOUT_SUCCESS" });
    } catch (error) {
        console.error("Logout User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.user;
        const updates = req.body;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        const mergedUpdates = { ...user, ...updates };

        if (!updates.password) {
            mergedUpdates.password = user.password;
        }

        await User.update(id, mergedUpdates);

        return res.status(200).json({ message: "USER_UPDATED", updatedFields: updates });
    } catch (error) {
        console.error("Update User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, newPassword, seedWord } = req.body;

        console.log(email, newPassword, seedWord);
        const user = await User.findByEmail(email);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (user.seedWord !== seedWord) {
            return handleHttpError(res, "INVALID_SEED_WORD", 400);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await User.update(user.id, { password: hashedNewPassword });

        await sendEmail(
            user.email,
            "Tu contraseña ha sido actualizada",
            `<h2>Hola ${user.email.split(".")[0]}</h2>
            <p>Tu contraseña ha sido cambiada correctamente.</p>
            <p>Si no fuiste tú, por favor contacta con soporte.</p>`
        );

        return res.status(200).json({ message: "PASSWORD_UPDATED_SUCCESS" });
    } catch (error) {
        console.error("Update Password Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateSeedWord = async (req, res) => {
    try {
        const { id } = req.user;
        const { seedWord } = req.body;
        await User.update(id, { seedWord });
        return res.status(200).json({ message: "SEED_WORD_UPDATED_SUCCESS" });
    } catch (error) {   
        console.error("Update Seed Word Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.delete(id);
        return res.status(200).json({ message: "USER_DELETED" });
    } catch (error) {
        console.error("Delete User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
}

const getUserProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        return res.json({ user: { ...user, password: undefined } });
    } catch (error) {
        console.error("Get User Profile Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getUserMetadata = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        return res.json({ metadata: user.metadata });
    } catch (error) {
        console.error("Get User Metadata Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};  

const updateUserMetadata = async (req, res) => {
    try {
        const { id } = req.user;
        const updates = req.body;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (user.role === "ADMIN") {
            return handleHttpError(res, "ADMIN_CANNOT_HAVE_METADATA", 400);
        }

        const METADATA_FIELDS = {
            STUDENT: [
                "firstName", "lastName", "birthDate", "dni", "degree", "specialization", "institution", "endDate",
                "languages", "programmingLanguages", "academicHistory", "milestones", "certifications",
                "workExperience", "roadmaps", "updatedAt"
            ],
            TEACHER: [
                "firstName", "lastName", "birthDate", "dni", "specialization", "updatedAt"
            ],
        };

        const validFields = METADATA_FIELDS[user.role];
        const metadataUpdates = {};

        for (const key in updates) {
            if (validFields.includes(key)) {
                if (Array.isArray(updates[key]) && Array.isArray(user.metadata[key])) {
                    const existingData = user.metadata[key] || [];
                    
                    const mergedData = [...existingData, ...updates[key]].reduce((acc, item) => {
                        if (!acc.some(el => JSON.stringify(el) === JSON.stringify(item))) {
                            acc.push(item);
                        }
                        return acc;
                    }, []);

                    metadataUpdates[`metadata.${key}`] = mergedData;
                } else {
                    if (!user.metadata[key]) {
                        metadataUpdates[`metadata.${key}`] = updates[key];
                    }
                }
            }
        }

        if (Object.keys(metadataUpdates).length === 0) {
            return handleHttpError(res, "NO_VALID_FIELDS_TO_UPDATE", 400);
        }

        metadataUpdates["metadata.updatedAt"] = new Date().toISOString();
        await User.update(id, metadataUpdates);

        return res.status(200).json({ message: "METADATA_UPDATED_SUCCESS", updatedFields: metadataUpdates });
    } catch (error) {
        console.error("Update User Metadata Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const deleteUserMetadata = async (req, res) => {
    try {
        const { id } = req.user;
        const updates = req.body; 

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (user.role === "ADMIN") {
            return handleHttpError(res, "ADMIN_CANNOT_HAVE_METADATA", 400);
        }

        const METADATA_FIELDS = {
            STUDENT: [
                "firstName", "lastName", "birthDate", "dni", "degree", "specialization", "institution", "endDate",
                "languages", "programmingLanguages", "academicHistory", "milestones", "certifications",
                "workExperience", "roadmaps", "updatedAt"
            ],
            TEACHER: [
                "firstName", "lastName", "birthDate", "dni", "specialization", "updatedAt"
            ],
        };

        const validFields = METADATA_FIELDS[user.role];
        const metadataDeletes = {};

        for (const key in updates) {
            if (validFields.includes(key)) {
                if (Array.isArray(user.metadata[key]) && Array.isArray(updates[key])) {
                    const existingData = user.metadata[key] || [];
                    const filteredData = existingData.filter(item => 
                        !updates[key].some(toDelete => JSON.stringify(toDelete) === JSON.stringify(item))
                    );

                    if (filteredData.length === 0) {
                        metadataDeletes[`metadata.${key}`] = admin.firestore.FieldValue.delete();
                    } else {
                        metadataDeletes[`metadata.${key}`] = filteredData;
                    }
                } else {
                    metadataDeletes[`metadata.${key}`] = admin.firestore.FieldValue.delete();
                }
            }
        }

        if (Object.keys(metadataDeletes).length === 0) {
            return handleHttpError(res, "NO_VALID_FIELDS_TO_DELETE", 400);
        }

        metadataDeletes["metadata.updatedAt"] = new Date().toISOString();
        await User.update(id, metadataDeletes);

        return res.status(200).json({ message: "METADATA_DELETED_SUCCESS", deletedFields: Object.keys(metadataDeletes) });
    } catch (error) {
        console.error("Delete User Metadata Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getAllStudents = async (req, res) => {
    try {
        const users = await User.findByRole("STUDENT"); 
        return res.json(users);
    } catch (error) {
        console.error("Get All Users Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getSpecializationStudent = async (req, res) => {
    try {
        const { specialization } = req.query;
        const users = await User.findByRole("STUDENT"); 
        const filteredUsers = users.filter(user => user.metadata.specialization === specialization);
        return res.json(filteredUsers);
    } catch (error) {
        console.error("Get Specialization Student Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
}

const getStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        return res.json(user);
    } catch (error) {
        console.error("Get Student Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const createAdmin = async (req, res) => {
    try {
        const email = "admin@example.com";
        const password = "S3guroPassw0rd";
        const seedWord = "securityphrase";

        try {
            await User.findByEmail(email);
            return handleHttpError(res, "USER_ALREADY_EXISTS", 400);
        } catch (error) {}

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User(email, hashedPassword, seedWord, "ADMIN");
        const savedUser = await newUser.save();

        const token = generateToken({ email: savedUser.email, role: savedUser.role });

        return res.status(201).json({ message: "HARDCODED_ADMIN_CREATED", token, user: { email: savedUser.email, role: savedUser.role } });
    } catch (error) {
        console.error("Register Hardcoded Admin Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.json(users);
    } catch (error) {
        console.error("Get All Users Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params; 
        const updates = req.body;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (user.role === "ADMIN") return handleHttpError(res, "CANNOT_UPDATE_ADMIN", 403);

        if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
        
        const allowedUpdates = ["email", "password", "seedWord", "role", "metadata"];
        const filteredUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        if (Object.keys(filteredUpdates).length === 0) {
            return handleHttpError(res, "NO_VALID_FIELDS_TO_UPDATE", 400);
        }

        const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, { new: true });
        return res.status(200).json({ message: "USER_UPDATED_SUCCESSFULLY", updatedUser });
    } catch (error) {
        console.error("Admin Update User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const deleteUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params; 

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (user.role === "ADMIN") return handleHttpError(res, "CANNOT_DELETE_ADMIN", 403);

        await User.findByIdAndDelete(id);
        return res.status(200).json({ message: "USER_DELETED_SUCCESSFULLY" });
    } catch (error) {
        console.error("Admin Delete User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

module.exports = { 
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    updatePassword,
    updateSeedWord,
    deleteUser,
    getUserProfile,
    getUserMetadata,
    updateUserMetadata,
    deleteUserMetadata,
    getAllStudents,
    getSpecializationStudent,
    getStudent,
    createAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
};
