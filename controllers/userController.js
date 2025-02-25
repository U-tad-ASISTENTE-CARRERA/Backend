const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
const Degree = require("../models/Degree");
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
        const userId = savedUser.id; 
        const token = generateToken({ id: userId, email: savedUser.email, role: savedUser.role, seedWord: savedUser.seedWord });
        
        await sendEmail(
            email,
            "Bienvenido a la plataforma",
            `<h2>Hola ${email.split(".")[0]}</h2>
            <p>Tu cuenta ha sido creada con éxito.</p>
            <p>Gracias por registrarte.</p>`
        );

        return res.status(201).json({ 
            message: "USER_CREATED", 
            token, 
            user: { ...savedUser, password: undefined } 
        });
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
        if (user.role === "ADMIN") return handleHttpError(res, "ADMIN_CANNOT_HAVE_METADATA", 400);
       
        const METADATA_FIELDS = {
            STUDENT: ["firstName", "lastName", "birthDate", "gender", "dni", "degree", "specialization", "institution", "endDate", "languages", "skills", "certifications", "workExperience"],
            TEACHER: ["firstName", "lastName", "dni", "gender", "specialization"],
        };
        const validFields = METADATA_FIELDS[user.role] || [];
        const metadataUpdates = {};
        const updateLog = [];

        if (!user.metadata) user.metadata = {};
        if (!user.updateHistory || !Array.isArray(user.updateHistory)) user.updateHistory = [];
        for (const key in updates) {
            if (validFields.includes(key)) {
                const existingValue = user.metadata[key];

                if (Array.isArray(updates[key]) && Array.isArray(existingValue)) {
                    const mergedData = [...new Set([...existingValue, ...updates[key]].map(JSON.stringify))].map(JSON.parse);

                    if (JSON.stringify(existingValue) !== JSON.stringify(mergedData)) {
                        metadataUpdates[`metadata.${key}`] = mergedData;
                        updateLog.push({ field: key, oldValue: existingValue ?? null, newValue: mergedData });
                    }
                } else {
                    if (existingValue !== updates[key]) {
                        metadataUpdates[`metadata.${key}`] = updates[key];
                        updateLog.push({ field: key, oldValue: existingValue ?? null, newValue: updates[key] });
                    }
                }
            }
        }

        if (Object.keys(metadataUpdates).length === 0) return handleHttpError(res, "NO_VALID_FIELDS_TO_UPDATE", 400);
        const now = new Date();
        user.updateHistory.push({
            timestamp: now.toISOString(),
            changes: updateLog.filter(change => change.oldValue !== undefined && change.newValue !== undefined)
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        user.updateHistory = user.updateHistory.filter(entry => new Date(entry.timestamp) > oneYearAgo);
        metadataUpdates["metadata.updatedAt"] = now.toISOString();
        metadataUpdates["updateHistory"] = user.updateHistory;
        await User.update(id, metadataUpdates);

        return res.status(200).json({
            message: "METADATA_UPDATED_SUCCESS",
            updatedFields: metadataUpdates,
            updateHistory: user.updateHistory
        });
    } catch (error) {
        console.error("Update User Metadata Error:", error);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const deleteUserMetadata = async (req, res) => {
    try {
        const { id } = req.user;
        const updates = req.body; 
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (user.role === "ADMIN") return handleHttpError(res, "ADMIN_CANNOT_HAVE_METADATA", 400);
        
        const METADATA_FIELDS = {
            STUDENT: ["firstName", "lastName", "birthDate", "gender", "dni", "degree","specialization", "institution", "endDate", "languages", "skills", "certifications", "workExperience"],
            TEACHER: ["firstName", "lastName", "dni", "gender", "specialization"],
        };

        const validFields = METADATA_FIELDS[user.role];
        const metadataDeletes = {};
        const deleteLog = [];

        if (!user.metadata) user.metadata = {};
        if (!user.updateHistory) user.updateHistory = []; 
        for (const key in updates) {
            if (validFields.includes(key)) {
                if (Array.isArray(user.metadata[key]) && Array.isArray(updates[key])) {
                    const existingData = user.metadata[key] || [];
                    const filteredData = existingData.filter(item => 
                        !updates[key].some(toDelete => JSON.stringify(toDelete) === JSON.stringify(item))
                    );

                    if (filteredData.length === 0) {
                        metadataDeletes[`metadata.${key}`] = admin.firestore.FieldValue.delete();
                        deleteLog.push({ field: key, oldValue: existingData });
                    } else {
                        metadataDeletes[`metadata.${key}`] = filteredData;
                        deleteLog.push({ field: key, oldValue: updates[key] });
                    }
                } else {
                    if (user.metadata[key] !== undefined) {
                        metadataDeletes[`metadata.${key}`] = admin.firestore.FieldValue.delete();
                        deleteLog.push({ field: key, oldValue: user.metadata[key] });
                    }
                }
            }
        }

        if (deleteLog.length === 0) return handleHttpError(res, "NO_VALID_FIELDS_TO_DELETE", 400);
        const now = new Date();
        user.updateHistory.push({
            timestamp: now.toISOString(),
            changes: deleteLog.map(change => ({
                ...change,
                newValue: "DELETED"
            }))
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        user.updateHistory = user.updateHistory.filter(entry => new Date(entry.timestamp) > oneYearAgo);
        metadataDeletes["metadata.updatedAt"] = now.toISOString();
        metadataDeletes["updateHistory"] = user.updateHistory;

        await User.update(id, metadataDeletes);
        return res.status(200).json({ 
            message: "METADATA_DELETED_SUCCESS", 
            deletedFields: Object.keys(metadataDeletes),
            updateHistory: user.updateHistory
        });
    } catch (error) {
        console.error("Delete User Metadata Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateAH = async (req, res) => {
    try {
        const { id } = req.user;
        const { grades } = req.body; 

        if (!Array.isArray(grades)) {
            return handleHttpError(res, "INVALID_INPUT", 400, "Se espera un array de notas.");
        }

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (!user.metadata) user.metadata = {};
        if (!user.metadata.AH) {
            user.metadata.AH = { subjects: [] };

            const userDegree = user.metadata.degree;
            if (!userDegree) return handleHttpError(res, "DEGREE_NOT_DEFINED", 400, "El usuario no tiene un grado asignado.");

            try {
                const degree = await Degree.findByName(userDegree);

                user.metadata.AH.subjects = degree.subjects.map(subject => ({
                    ...subject,
                    grade: null 
                }));
            } catch (error) {
                return handleHttpError(res, "DEGREE_NOT_FOUND", 404, `No se encontró el grado '${userDegree}'.`);
            }
        }

        if (!user.updateHistory) user.updateHistory = []; 

        const updateLog = [];
        const updatedSubjects = user.metadata.AH.subjects.map(subject => {
            const newGrade = grades.find(g => g.name === subject.name);
            if (newGrade && newGrade.grade !== subject.grade) {
                updateLog.push({
                    field: subject.name,
                    oldValue: subject.grade,
                    newValue: newGrade.grade
                });
            }
            return newGrade ? { ...subject, grade: newGrade.grade } : subject;
        });

        if (updateLog.length === 0) {
            return handleHttpError(res, "NO_VALID_FIELDS_TO_UPDATE", 400);
        }

        for (const subject of updatedSubjects) {
            if (subject.grade !== null && (subject.grade < 0 || subject.grade > 10)) {
                return handleHttpError(res, "INVALID_GRADE_RANGE", 400, `La nota de '${subject.name}' debe estar entre 0 y 10.`);
            }
        }

        const subjectsWithGrades = updatedSubjects.filter(subject => subject.grade !== null);
        const totalCredits = updatedSubjects.reduce((acc, subject) => acc + subject.credits, 0);
        const totalCreditsWithGrades = subjectsWithGrades.reduce((acc, subject) => acc + subject.credits, 0);
        const averageGrade = subjectsWithGrades.length > 0
            ? subjectsWithGrades.reduce((acc, subject) => acc + subject.grade, 0) / subjectsWithGrades.length
            : null;

        const top5BestSubjects = subjectsWithGrades
            .filter(subject => subject.grade >= 7 && subject.grade <= 10)
            .sort((a, b) => b.grade - a.grade)
            .slice(0, 5);

        const top5WorstSubjects = subjectsWithGrades
            .sort((a, b) => a.grade - b.grade)
            .slice(0, 5);

        const skillsSet = new Set();
        updatedSubjects.forEach(subject => {
            if (subject.grade !== null && subject.grade > 5.0) {
                subject.skills.forEach(skill => skillsSet.add(skill));
            }
        });

        const acquiredSkills = Array.from(skillsSet);

        const yearsCompleted = [];
        const yearsGrouped = updatedSubjects.reduce((acc, subject) => {
            acc[subject.year] = acc[subject.year] || [];
            acc[subject.year].push(subject);
            return acc;
        }, {});

        Object.keys(yearsGrouped).forEach(year => {
            const subjectsInYear = yearsGrouped[year];
            const gradedSubjects = subjectsInYear.filter(subject => subject.grade !== null);
            const failedSubjects = gradedSubjects.filter(subject => subject.grade < 5.0);

            if (gradedSubjects.length === subjectsInYear.length && failedSubjects.length <= 2) {
                yearsCompleted.push(parseInt(year));
            }
        });

        const now = new Date();
        user.updateHistory.push({
            timestamp: now.toISOString(),
            changes: updateLog
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        user.updateHistory = user.updateHistory.filter(entry => new Date(entry.timestamp) > oneYearAgo);

        const metadataUpdates = {
            "metadata.AH.subjects": updatedSubjects,
            "metadata.AH.averageGrade": averageGrade,
            "metadata.AH.totalCredits": totalCredits,
            "metadata.AH.totalCreditsWithGrades": totalCreditsWithGrades,
            "metadata.AH.top5BestSubjects": top5BestSubjects,
            "metadata.AH.top5WorstSubjects": top5WorstSubjects,
            "metadata.AH.yearsCompleted": yearsCompleted,
            "metadata.AH.lastUpdatedAt": now.toISOString(),
            "metadata.skills": acquiredSkills,
            "updateHistory": user.updateHistory,
            updatedAt: now.toISOString(),
        };

        await User.update(id, metadataUpdates);

        return res.status(200).json({ 
            message: "SUBJECTS_METADATA_UPDATED", 
            updatedSubjects, 
            metadataUpdates,
            updateHistory: user.updateHistory
        });
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

        if (user.metadata && user.metadata.AH) {
            return res.status(200).json({ 
                subjects: user.metadata.AH.subjects || [], 
                lastUpdatedAt: user.metadata.AH.lastUpdatedAt || null 
            });
        }

        if (!user.metadata) user.metadata = {};
        const userDegree = user.metadata.degree;
        if (!userDegree) return handleHttpError(res, "DEGREE_NOT_DEFINED", 400, "El usuario no tiene un grado asignado.");

        try {
            const degree = await Degree.findByName(userDegree);

            const subjects = degree.subjects.map(subject => ({
                ...subject,
                grade: null 
            }));

            return res.status(200).json({
                subjects,
                lastUpdatedAt: null
            });

        } catch (error) {
            return handleHttpError(res, "DEGREE_NOT_FOUND", 404, `No se encontró el grado '${userDegree}'.`);
        }

    } catch (error) {
        console.error("Error retrieving subjects metadata:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const updateRoadmap = async (req, res) => {
    try {
        const { id } = req.user;
        const { sectionName, topicName, newStatus } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

        let roadmap = user.metadata.roadmap;
        const acquiredSkills = new Set(user.metadata.skills || []);
        const userSubjects = user.metadata.AH?.subjects || [];

        // Si el roadmap no está definido, intentar obtenerlo de la base de datos
        if (!roadmap || roadmap.name !== user.metadata.specialization) {
            try {
                console.log(user.metadata.specialization);
                const roadmapData = await Roadmap.findByName(user.metadata.specialization);
                if (!roadmapData) return res.status(404).json({ error: "ROADMAP_NOT_FOUND" });

                roadmap = roadmapData;
                user.metadata.roadmap = roadmap;
            } catch (err) {
                return res.status(500).json({ error: "ERROR_FETCHING_ROADMAP" });
            }
        }

        let hasChanges = false;
        const updatedRoadmapBody = { ...roadmap.body };

        // Auto-completar temas según las notas del usuario
        for (const [section, topics] of Object.entries(updatedRoadmapBody)) {
            for (const [topic, topicData] of Object.entries(topics)) {
                if (topicData?.subject) {
                    const subjectMatch = userSubjects.find(
                        (s) => s.name === topicData.subject && s.grade >= 5.0
                    );

                    if (subjectMatch && topicData.status !== "done") {
                        topicData.status = "done";
                        hasChanges = true;
                        if (topicData.skill) acquiredSkills.add(topicData.skill);
                    }
                }
            }
        }

        let metadataUpdates = {};
        if (!sectionName || !topicName || !newStatus) {
            if (hasChanges) {
                metadataUpdates = {
                    "metadata.roadmap.body": updatedRoadmapBody,
                    "metadata.skills": Array.from(acquiredSkills),
                    "metadata.roadmap.lastUpdatedAt": new Date().toISOString(),
                    "updatedAt": new Date().toISOString(),
                };
                await User.update(id, metadataUpdates);
                return res.status(200).json({ message: "Roadmap actualizado automáticamente" });
            }
            return res.status(400).json({ error: "NO_CHANGES_DETECTED" });
        }

        if (!updatedRoadmapBody[sectionName] || !updatedRoadmapBody[sectionName][topicName]) return res.status(404).json({ error: "SECTION_OR_TOPIC_NOT_FOUND" });
        const topic = updatedRoadmapBody[sectionName][topicName];
        if (topic.status === newStatus) return res.status(400).json({ error: "STATUS_ALREADY_SET" });
        
        topic.status = newStatus;
        hasChanges = true;
        if (newStatus === "done" && topic.skill) acquiredSkills.add(topic.skill);
        metadataUpdates = {
            [`metadata.roadmap.body.${sectionName}.${topicName}.status`]: newStatus,
            "metadata.skills": Array.from(acquiredSkills),
            "metadata.roadmap.lastUpdatedAt": new Date().toISOString(),
            "updatedAt": new Date().toISOString(),
        };

        if (hasChanges) {
            await User.update(id, metadataUpdates);
            return res.status(200).json({ message: "Roadmap actualizado correctamente" });
        }

        return res.status(400).json({ error: "NO_CHANGES_DETECTED" });
    } catch (error) {
        console.error("Error updating roadmap:", error);
        res.status(500).json({ error: "Error updating roadmap" });
    }
};

const getRoadmap = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (!user.metadata || !user.metadata.roadmap) return res.status(404).json({ error: "ROADMAP_NOT_FOUND" });
        return res.status(200).json({ roadmap: user.metadata.roadmap });
    } catch (error) {
        console.error("Error retrieving roadmap:", error.message);
        return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
};

const deleteRoadmap = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
        if (!user.metadata || !user.metadata.roadmap) return handleHttpError(res, "ROADMAP_NOT_FOUND", 404);
        
        const metadataUpdates = {
            "metadata.roadmap": admin.firestore.FieldValue.delete(),
            "metadata.updatedAt": new Date().toISOString(),
        };

        await User.update(id, metadataUpdates);
        return res.json({ message: "Roadmap deleted successfully" });
    } catch (error) {
        console.error("Error deleting roadmap:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const addTeacherToStudent = async (req, res) => {
    try {
        const { id } = req.user; 
        const { teacherId } = req.body; 
        const student = await User.findById(id);
        if (!student) return handleHttpError(res, "STUDENT_NOT_FOUND", 404);
        if (student.role !== "STUDENT") return handleHttpError(res, "NOT_A_STUDENT", 403);
        const teacher = await User.findById(teacherId);
        if (!teacher) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);
        if (teacher.role !== "TEACHER") return handleHttpError(res, "NOT_A_TEACHER", 403);

        const teacherList = student.metadata.teacherList || [];
        if (teacherList.includes(teacherId)) {
            return handleHttpError(res, "TEACHER_ALREADY_ADDED", 400);
        }

        teacherList.push(teacherId);
        await User.update(id, { "metadata.teacherList": teacherList });

        return res.status(200).json({ message: "TEACHER_ADDED_TO_STUDENT", teacherId });
    } catch (error) {
        console.error("Add Teacher To Student Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getAllTeacher = async (req, res) => {
    try {
        const users = await User.findByRole("TEACHER"); 
        return res.json(users);
    } catch (error) {
        console.error("Get All Users Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getTeachersOfStudent = async (req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "STUDENT_NOT_FOUND", 404);
        if (user.role !== "STUDENT") return handleHttpError(res, "NOT_A_STUDENT", 403);

        const teacherIds = user.metadata.teacherList || [];
        if (teacherIds.length === 0) return res.status(200).json({ teachers: [] });
        const teachers = await Promise.all(
            teacherIds.map(async (teacherId) => {
                const teacher = await User.findById(teacherId);
                return teacher || null;
            })
        );

        const validTeachers = teachers.filter(teacher => teacher !== null);
        return res.status(200).json({ teachers: validTeachers });
    } catch (error) {
        console.error("Get Teachers of Student Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const sendNotificationToTeacher = async (req, res) => {
    try {
        const { id } = req.user;
        const { teacherId, message } = req.body;

        const student = await User.findById(id);
        if (!student) return handleHttpError(res, "STUDENT_NOT_FOUND", 404);
        if (student.role !== "STUDENT") return handleHttpError(res, "NOT_A_STUDENT", 403);

        const teacher = await User.findById(teacherId);
        if (!teacher) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);
        if (teacher.role !== "TEACHER") return handleHttpError(res, "NOT_A_TEACHER", 403);

        if (!student.metadata.teacherList.includes(teacherId)) return handleHttpError(res, "TEACHER_NOT_IN_STUDENT_LIST", 403);
    
        const notification = {
            studentId: id,
            message,
            date: new Date().toISOString(),
            status: "unread"
        };

        const notifications = teacher.metadata.notifications || [];
        notifications.push(notification);
        const metadataUpdates = {
            "metadata.notifications": notifications,
            updatedAt: new Date().toISOString()
        };

        await User.update(teacherId, metadataUpdates);

        const emailSubject = "Nueva Notificación de un Estudiante";
        const emailBody = `
            <h2>Hola ${teacher.name}</h2>
            <p>Has recibido un nuevo mensaje de <strong>${student.name}</strong>.</p>
            <blockquote>${message}</blockquote>
            <p>Por favor, revisa tu cuenta para más detalles.</p>
        `;

        await sendEmail(teacher.email, emailSubject, emailBody);
        return res.status(200).json({ message: "NOTIFICATION_SENT", notification });
    } catch (error) {
        console.error("Send Notification Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getAllStudents = async (req, res) => {
    try {
        const { id } = req.user;
        const teacher = await User.findById(id);
        if (!teacher) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);
        if (teacher.role !== "TEACHER") return handleHttpError(res, "NOT_A_TEACHER", 403);

        const studentsSnapshot = await db
            .collection("users")
            .where("metadata.teacherList", "array-contains", id)
            .get();

        const students = studentsSnapshot.docs.map(doc => doc.data());
        return res.json(students);
    } catch (error) {
        console.error("Get All Teacher Students Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

const getSpecializationTeacher = async (req, res) => {
    try {
        const { specialization } = req.query;
        const users = await User.findByRole("TEACHER"); 
        const filteredUsers = users.filter(user => user.metadata.specialization === specialization);
        return res.json(filteredUsers);
    } catch (error) {
        console.error("Get specialization teacher Error:", error.message);
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

const getTeacherNotifications = async (req, res) => {
    try {
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) return handleHttpError(res, "TEACHER_NOT_FOUND", 404);
        if (user.role !== "TEACHER") return handleHttpError(res, "NOT_A_TEACHER", 403);

        const notifications = user.metadata.notifications || [];
        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("Get Teacher Notifications Error:", error.message);
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
    getRoadmap,
    deleteRoadmap,
    addTeacherToStudent,
    getTeachersOfStudent,
    sendNotificationToTeacher,
    getTeacherNotifications,
    getAllTeacher,
    getAllStudents,
    getSpecializationTeacher,
    getStudent,
    createAdmin,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
};