const admin = require("firebase-admin");
const path = require("path");

/**
 * Robust Firebase Initialization
 * Ensures the Admin SDK starts correctly even after a system reboot.
 */
function initializeFirebase() {
  if (admin.apps.length > 0) return admin.app();

  try {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(__dirname, process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, "firebaseKey.json");
    
    console.log(`Using Firebase key from: ${keyPath}`);
    const serviceAccount = require(keyPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    console.log("Firebase Admin Initialized ✅");
  } catch (error) {
    console.error("Firebase Initialization Error ❌:", error.message);
    // Instead of exiting, we log the error and wait. This prevents a crash loop.
    console.warn("Retrying initialization in 10 seconds...");
    setTimeout(initializeFirebase, 10000);
  }
}

initializeFirebase();

const db = admin.firestore();
const auth = admin.auth();

/**
 * Health Check: Verifies database connectivity.
 * If this fails, the server remains up but logs the error.
 */
async function checkConnectivity() {
  try {
    console.log("Checking Firestore connection...");
    await db.collection("health_check").doc("ping").set({ 
      lastPing: admin.firestore.FieldValue.serverTimestamp(),
      systemStatus: "active"
    });
    console.log("Firestore connection verified ✅");
  } catch (error) {
    console.error("Firestore Verification Error ❌:", error.message);
    // If permission denied, the key is likely invalid or missing permissions
    if (error.message.includes("PERMISSION_DENIED")) {
      console.error("TIP: Ensure your service account has 'Cloud Datastore User' or 'Firebase Firestore Admin' permissions.");
    }
    // Retry connectivity check after 30 seconds if it failed
    setTimeout(checkConnectivity, 30000);
  }
}

// Start the initial check
checkConnectivity();

module.exports = { db, auth, admin };
