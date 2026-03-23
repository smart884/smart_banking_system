const { db, auth } = require("./firebase");

async function checkUser() {
  const email = "khushipanchal9231@gmail.com";
  try {
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found Auth User: ${userRecord.uid}`);
    
    const userDoc = await db.collection("users").doc(userRecord.uid).get();
    if (userDoc.exists) {
      console.log("Firestore Profile Data:", JSON.stringify(userDoc.data(), null, 2));
    } else {
      console.log("No Firestore Profile found.");
    }
  } catch (error) {
    console.error("Error checking user:", error.message);
  }
  process.exit();
}

checkUser();
