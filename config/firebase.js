const admin = require("firebase-admin");
const dotenv = require("dotenv");
const cron = require("node-cron");
const { differenceInDays } = require("date-fns");

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.collection("test")
    .doc("connection_check")
    .set({
        status: "connected",
        timestamp: new Date().toISOString(),
    })
    .then(() => console.log("Firestore connected successfully"))
    .catch((error) => console.error("Firestore connection failed:", error));

async function deleteInactiveUsers() {
    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.get();
        const now = new Date();
        const batch = db.batch();
        let deletedCount = 0;

        snapshot.forEach((doc) => {
            const user = doc.data();
            if (user.updatedAt) {
                const lastUpdate = new Date(user.updatedAt);
                if (differenceInDays(now, lastUpdate) >= 365) {
                    batch.delete(doc.ref);
                    deletedCount++;
                }
            }
        });

        if (deletedCount > 0) {
            await batch.commit();
            console.log(`Deleted ${deletedCount} inactive users.`);
        } else {
            console.log("No inactive users found.");
        }
    } catch (error) {
        console.error("Error deleting inactive users:", error);
    }
}

deleteInactiveUsers();
cron.schedule("0 0 * * *", () => {
    console.log("Running inactive user cleanup...");
    deleteInactiveUsers();
});

module.exports = { db, deleteInactiveUsers };