const { Resend } = require("resend");

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

module.exports = sendEmail;