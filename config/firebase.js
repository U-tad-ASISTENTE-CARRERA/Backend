const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();

// const serviceAccount = require("../firebase.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.collection("test").doc("connection_check").set({
    status: "connected",
    timestamp: new Date().toISOString(),
})
.then(() => console.log("Firestore connected successfully"))
.catch((error) => console.error("Firestore connection failed:", error));

module.exports = { db };