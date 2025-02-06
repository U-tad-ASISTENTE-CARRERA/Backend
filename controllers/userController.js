const { db } = require("../config/firebase");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/handleJwt");
const { handleHttpError } = require("../utils/handleError");
// const { sendEmail } = require("../utils/handleResend");
const { Resend } = require("resend");
const User = require("../models/User");
const e = require("express");

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

const updatePassword = async (req, res) => {
    try {
        const { id } = req.user;
        const { newPassword, seedWord } = req.body;

        const user = await User.findById(id);

        if (user.seedWord !== seedWord) {
            return handleHttpError(res, "INVALID_SEED_WORD", 400);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await User.update(id, { password: hashedNewPassword });

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

const logoutUser = async (req, res) => {
    try {
        return res.status(200).json({ message: "LOGOUT_SUCCESS" });
    } catch (error) {
        console.error("Logout User Error:", error.message);
        return handleHttpError(res, "INTERNAL_SERVER_ERROR", 500);
    }
};

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

module.exports = { 
    registerUser,
    loginUser,
    updatePassword,
    logoutUser,
    getUserProfile,
    updateSeedWord,
};
