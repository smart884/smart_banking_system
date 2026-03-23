const { db, auth } = require("./firebase");

async function updateUser() {
  const email = "khushipanchal9231@gmail.com";
  const password = "dhruvi1234";
  try {
    const userRecord = await auth.getUserByEmail(email);
    await db.collection("users").doc(userRecord.uid).update({ password });
    console.log(`Updated user profile with password: ${email}`);
  } catch (error) {
    console.error("Error updating user:", error.message);
  }
  process.exit();
}

updateUser();
