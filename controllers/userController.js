const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
// const { sendEmail } = require("../utils/handleResend");
const { Resend } = require("resend");
const User = require("../models/User");
const Roadmap = require("../models/Roadmap");
const e = require("express");
const admin = require("firebase-admin");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, content) => {
    try {
        console.log("Sending email to:", to);
        await resend.emails.send({
            from: "Asistene de carrera <onboarding@resend.dev>",
            to : to,
            subject : subject,
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

        await User.update(user.id, { updatedAt: new Date().toISOString() });
        const token = generateToken({ id: user.id, email: user.email, role: user.role });

        return res.json({ 
            message: "LOGIN_SUCCESS", 
            token, 
            user: { ...user, password: undefined, updatedAt: new Date().toISOString() } 
        });

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
                "languages", "programmingLanguages", "certifications", "workExperience"
            ],
            TEACHER: [
                "firstName", "lastName", "birthDate", "dni", "specialization"
            ],
        };

        const validFields = METADATA_FIELDS[user.role];
        const metadataUpdates = {};

        if (!user.metadata) user.metadata = {};
        for (const key in updates) {
            if (validFields.includes(key)) {
                const existingValue = user.metadata[key];

                if (Array.isArray(updates[key]) && Array.isArray(existingValue)) {
                    const mergedData = [...existingValue, ...updates[key]].reduce((acc, item) => {
                        if (!acc.some(el => JSON.stringify(el) === JSON.stringify(item))) acc.push(item);
                        return acc;
                    }, []);

                    if (JSON.stringify(existingValue) !== JSON.stringify(mergedData)) metadataUpdates[`metadata.${key}`] = mergedData;
                } else {
                    if (existingValue !== updates[key]) metadataUpdates[`metadata.${key}`] = updates[key];
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

const updateAH = async (req, res) => {
    try {
        const { id } = req.user;
        const { subjects } = req.body;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (!user.metadata) user.metadata = {};
        if (!user.metadata.AH) user.metadata.AH = {};
        if (!user.metadata.AH.subjects) user.metadata.AH.subjects = [];

        // const updatedSubjects = user.metadata.AH.subjects.map(existingSubject => {
        //     const newSubjectData = subjects.find(s => s.name === existingSubject.name);
        //     return newSubjectData ? { ...existingSubject, grade: newSubjectData.grade ?? null } : existingSubject;
        // });

        for (const subject of subjects) {
            if (subject.grade !== undefined && (subject.grade < 0 || subject.grade > 10)) {
                return handleHttpError(res, "INVALID_GRADE_RANGE", 400, `La nota de '${subject.name}' debe estar entre 0 y 10.`);
            }
        }

        const updatedSubjects = user.metadata.AH.subjects.map(existingSubject => {
            const newSubjectData = subjects.find(s => s.name === existingSubject.name);
            return newSubjectData ? { 
                ...existingSubject, 
                grade: newSubjectData.grade ?? existingSubject.grade
            } : existingSubject;
        });

        subjects.forEach(newSubject => {
            if (!updatedSubjects.some(existing => existing.name === newSubject.name)) {
                updatedSubjects.push({ 
                    ...newSubject,
                    grade: newSubject.grade ?? null
                });
            }
        });

        const subjectsWithGrades = updatedSubjects.filter(subject => subject.grade !== null);
        const totalCredits = updatedSubjects.reduce((acc, subject) => acc + subject.credits, 0);
        const totalCreditsWithGrades = subjectsWithGrades.reduce((acc, subject) => acc + subject.credits, 0);
        const averageGrade = subjectsWithGrades.length > 0 
            ? subjectsWithGrades.reduce((acc, subject) => acc + subject.grade, 0) / subjectsWithGrades.length
            : null;

        const sortedSubjects = [...subjectsWithGrades].sort((a, b) => b.grade - a.grade);
        const top5BestSubjects = sortedSubjects.slice(0, 5);
        const top5WorstSubjects = sortedSubjects.slice(-5);

        const yearsCompleted = [];
        const yearsGrouped = updatedSubjects.reduce((acc, subject) => {
            acc[subject.year] = acc[subject.year] || [];
            acc[subject.year].push(subject);
            return acc;
        }, {});

        Object.keys(yearsGrouped).forEach(year => {
            const allSubjectsGraded = yearsGrouped[year].every(subject =>
                updatedSubjects.some(s => s.name === subject.name && s.grade !== null)
            );
            if (allSubjectsGraded) yearsCompleted.push(parseInt(year));
        });

        const metadataUpdates = {
            "metadata.AH.subjects": updatedSubjects,
            "metadata.AH.averageGrade": averageGrade,
            "metadata.AH.totalCredits": totalCredits,
            "metadata.AH.totalCreditsWithGrades": totalCreditsWithGrades,
            "metadata.AH.top5BestSubjects": top5BestSubjects,
            "metadata.AH.top5WorstSubjects": top5WorstSubjects,
            "metadata.AH.yearsCompleted": yearsCompleted,
            "metadata.AH.lastUpdatedAt": new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await User.update(id, metadataUpdates);

        return res.status(200).json({ message: "SUBJECTS_METADATA_UPDATED", updatedSubjects, metadataUpdates });
    } catch (error) {
        console.error("Error updating subjects metadata:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getAH = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        if (!user.metadata || !user.metadata.AH) {
            return res.status(200).json({ subjects: [], lastUpdatedAt: null });
        }

        return res.status(200).json({ 
            subjects: user.metadata.AH, 
            lastUpdatedAt: user.metadata.lastUpdatedAt || null 
        });
    } catch (error) {
        console.error("Error retrieving subjects metadata:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateRoadmap = async (req, res) => {
    try {
        const { id } = req.user;
        const { roadmapId, status } = req.body;

        const validStatuses = ["TODO", "DOING", "DONE"];

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (!user.metadata) user.metadata = {};
        if (!user.metadata.roadmaps) user.metadata.roadmaps = [];

        let roadmaps = user.metadata.roadmaps;

        const roadmapIndex = roadmaps.findIndex(r => r.roadmapId === roadmapId);

        if (roadmapIndex !== -1) {
            if (status && validStatuses.includes(status)) roadmaps[roadmapIndex].status = status;
            roadmaps[roadmapIndex].updatedAt = new Date().toISOString();
        } else {
            roadmaps.push({
                roadmapId,
                status: "TODO",
                updatedAt: new Date().toISOString(),
            });
        }

        const metadataUpdates = {
            "metadata.roadmaps": roadmaps,
            "metadata.updatedAt": new Date().toISOString(),
        };

        await User.update(id, metadataUpdates);

        return res.json({ message: "Roadmap updated successfully", roadmaps });
    } catch (error) {
        console.error("Error updating roadmap:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getRoadmaps = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

        // Asegurar que metadata y roadmaps existen
        if (!user.metadata) user.metadata = {};
        if (!user.metadata.roadmaps) user.metadata.roadmaps = [];

        const userRoadmaps = user.metadata.roadmaps;
        if (userRoadmaps.length === 0) return res.json([]);

        // Extraer solo los roadmapId que tiene el usuario
        const roadmapIds = userRoadmaps.map(r => r.roadmapId);

        // Buscar solo los roadmaps con los IDs que tiene el usuario
        const roadmaps = await Roadmap.findAll({
            where: { id: roadmapIds }
        });

        // Mapear para incluir el estado del roadmap
        const roadmapsWithStatus = roadmaps
            .filter(r => roadmapIds.includes(r.id)) // Filtrar por seguridad
            .map(r => ({
                ...r, // No usamos toJSON() porque ya es un objeto
                status: userRoadmaps.find(ur => ur.roadmapId === r.id)?.status || "TODO"
            }));

        res.json(roadmapsWithStatus);
    } catch (error) {
        console.error("Error fetching roadmaps:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteRoadmap = async (req, res) => {
    try {
        const { id } = req.user;
        const { roadmapId } = req.body;
        if (!roadmapId) return handleHttpError(res, "ROADMAP_ID_REQUIRED", 400);
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (!user.metadata) user.metadata = {};
        if (!user.metadata.roadmaps) user.metadata.roadmaps = [];
        let roadmaps = user.metadata.roadmaps;

        const newRoadmaps = roadmaps.filter(r => r.roadmapId !== roadmapId);
        if (newRoadmaps.length === roadmaps.length) return handleHttpError(res, "ROADMAP_NOT_FOUND", 404);
        
        const metadataUpdates = {
            "metadata.roadmaps": newRoadmaps,
            "metadata.updatedAt": new Date().toISOString(),
        };

        await User.update(id, metadataUpdates);

        return res.json({ message: "Roadmap deleted successfully", roadmaps: newRoadmaps });
    } catch (error) {
        console.error("Error deleting roadmap:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};
const addStudentToTeacher = async (req, res) => {
    try {
        const { id } = req.user;
        const { studentId } = req.body;

        const teacher = await User.findById(id);
        if (!teacher) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);

        const student = await User.findById(studentId);
        if (!student) return handleHttpError(res, "STUDENT_NOT_FOUND", 404);

        if (teacher.role !== "TEACHER") return handleHttpError(res, "NOT_A_TEACHER", 403);
        if (student.role !== "STUDENT") return handleHttpError(res, "NOT_A_STUDENT", 403);

        const studentList = teacher.metadata.studentList || [];
        if (studentList.includes(studentId)) return handleHttpError(res, "STUDENT_ALREADY_ADDED", 400);

        studentList.push(studentId);
        await User.update(id, { "metadata.studentList": studentList });

        return res.status(200).json({ message: "STUDENT_ADDED_TO_TEACHER", studentId });
    } catch (error) {
        console.error("Add Student To Teacher Error:", error.message);
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

const getAllTeacherStudents = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);

        const studentIds = user.metadata.studentList || [];
        if (studentIds.length === 0) return res.json([]);

        const studentsSnapshot = await db.collection("users").where("id", "in", studentIds).get();
        const students = studentsSnapshot.docs.map(doc => doc.data());

        return res.json(students);
    } catch (error) {
        console.error("Get All Teacher Students Error:", error.message);
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
        const email = "alvaro.vazquez.1716@gmail.com";
        const password = "SecurePass@123";
        const seedWord = "securityphrase";

        try {
            await User.findByEmail(email);
            return handleHttpError(res, "USER_ALREADY_EXISTS", 400);
        } catch (error) {}

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User(email, hashedPassword, seedWord, "ADMIN");
        const savedUser = await newUser.save();

        const token = generateToken({ email: savedUser.email, role: savedUser.role });
        await sendEmail(
            email,
            "Bienvenido a la plataforma",
            `<h2>Hola ${email.split(".")[0]}</h2>
            <p>Tu cuenta ha sido creada con exito.</p>
            <p>Gracias por registrarte.</p>`
        );

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
    updateAH,
    getAH,
    updateRoadmap,
    getRoadmaps,
    deleteRoadmap,
    getAllStudents,
    addStudentToTeacher,
    getAllTeacherStudents,
    getSpecializationStudent,
    getStudent,
    createAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
};
