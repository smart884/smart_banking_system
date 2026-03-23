const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase");
const { authMiddleware, authorize } = require("../middleware/auth");

/**
 * GET /api/users/profile
 * Returns the current user's profile.
 */
router.get("/profile", authMiddleware, async (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * GET /api/users/all (Admin/Manager/Clerk)
 * Fetches all users from Firestore.
 */
router.get("/all", authMiddleware, authorize(["admin", "manager", "clerk"]), async (req, res) => {
  try {
    const { status } = req.query;
    console.log(`[API] Fetching all users. Filter status: ${status || 'none'}`);
    
    let query = db.collection("users");
    
    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    console.log(`[API] Found ${snapshot.size} users in Firestore.`);
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        uid: doc.id, 
        ...data,
        // Ensure status exists for frontend filtering even if it's missing in DB
        status: data.status || "pending" 
      };
    });
    
    res.json({ success: true, users });
  } catch (error) {
    console.error("GET /all error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/users/status (Admin/Clerk/Manager Only)
 * Updates user status (approved/rejected).
 */
router.patch("/status", authMiddleware, authorize(["admin", "manager", "clerk"]), async (req, res) => {
  const { uid, status } = req.body;
  if (!uid || !status) return res.status(400).json({ success: false, error: "UID and status required." });

  try {
    console.log(`[API] Updating user ${uid} status to: ${status}`);
    
    // Check if document exists first to provide better error message
    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      console.error(`[API] User ${uid} not found in Firestore.`);
      return res.status(404).json({ success: false, error: "User profile not found in database." });
    }

    await userRef.update({ 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: req.user.email
    });
    
    console.log(`[API] User ${uid} updated successfully ✅`);
    res.json({ success: true, message: `User status updated to ${status}.` });
  } catch (error) {
    console.error(`[API] PATCH /status error for user ${uid}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
