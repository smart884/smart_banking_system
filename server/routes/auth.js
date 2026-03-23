const express = require("express");
const router = express.Router();
const { auth, db, admin } = require("../firebase");
const { authMiddleware } = require("../middleware/auth");

/**
 * Helper: Validate Aadhaar (12 digits)
 */
const isValidAadhaar = (val) => /^\d{12}$/.test(String(val).replace(/\s/g, ""));

/**
 * Helper: Validate PAN (5 letters + 4 digits + 1 letter)
 */
const isValidPAN = (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(val);

/**
 * POST /api/auth/register
 * Creates a new user in Firebase Auth and Firestore.
 */
router.post("/register", async (req, res) => {
  const {
    email, password, firstName, middleName, lastName,
    gender, dob, address1, address2, address3, pinCode,
    contact, altContact, aadhaar, pan, role = "customer"
  } = req.body;

  try {
    // 1. Mandatory Field Validation
    if (!email || !password || !firstName || !lastName || !contact || !aadhaar || !pan) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    if (String(contact).length !== 10) {
      return res.status(400).json({ success: false, error: "Contact must be exactly 10 digits." });
    }

    if (!isValidAadhaar(aadhaar)) {
      return res.status(400).json({ success: false, error: "Invalid Aadhaar format (12 digits required)." });
    }

    if (!isValidPAN(pan)) {
      return res.status(400).json({ success: false, error: "Invalid PAN format (e.g., ABCDE1234F)." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }

    // 2. Create User in Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`,
      });
    } catch (authError) {
      console.error("Auth Creation Error:", authError.message);
      return res.status(400).json({ 
        success: false, 
        error: authError.code === 'auth/email-already-exists' ? "Email already registered." : authError.message 
      });
    }

    // 3. Save User Data in Firestore
    const userData = {
      uid: userRecord.uid,
      firstName,
      middleName: middleName || "",
      lastName,
      gender: gender || "",
      dob: dob || "",
      address1: address1 || "",
      address2: address2 || "",
      address3: address3 || "",
      pinCode: pinCode || "",
      contact,
      altContact: altContact || "",
      email,
      aadhaar: String(aadhaar).replace(/\s/g, ""),
      pan: String(pan).toUpperCase(),
      role,
      status: "pending", // Default status for new users
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log(`[API] Saving user to Firestore: ${userRecord.uid} (${email})`);
    await db.collection("users").doc(userRecord.uid).set(userData);
    console.log(`[API] User saved successfully ✅`);

    res.status(201).json({
      success: true,
      message: "User registered successfully! Please login.",
      uid: userRecord.uid
    });

  } catch (error) {
    console.error("Registration Error ❌:", error);
    res.status(500).json({ success: false, error: "An internal server error occurred." });
  }
});

/**
 * GET /api/auth/me
 * Returns current user's profile from Firestore.
 */
router.get("/me", authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
