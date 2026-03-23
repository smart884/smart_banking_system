const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

/**
 * GET /api/manager/users
 * Fetches all user profiles from Firestore
 */
router.get("/users", async (req, res) => {
  try {
    console.log("Manager: Fetching all users from Firestore...");
    const snapshot = await db.collection("users").get();
    
    if (snapshot.empty) {
      console.log("Manager: No users found in Firestore.");
      return res.json({ users: [] });
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Manager: Successfully fetched ${users.length} users.`);
    res.json({ users });
  } catch (error) {
    console.error("Manager Fetch Users Error ❌:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch users: " + error.message 
    });
  }
});

const fs = require("fs");
const path = require("path");

const pendingFile = path.join(__dirname, "..", "src", "data", "pendingTransfers.json");

/**
 * GET /api/manager/transfers
 * Fetches pending transfers from local storage
 */
router.get("/transfers", async (req, res) => {
  try {
    const list = fs.existsSync(pendingFile) 
      ? JSON.parse(fs.readFileSync(pendingFile, "utf-8")) 
      : [];
    res.json({ pending: list.filter(x => x.status === "pending") });
  } catch (error) {
    console.error("Manager Fetch Transfers Error ❌:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/manager/transfers/decide
 * Approve or reject a transfer
 */
router.post("/transfers/decide", async (req, res) => {
  try {
    const { id, approve } = req.body || {};
    const list = fs.existsSync(pendingFile) 
      ? JSON.parse(fs.readFileSync(pendingFile, "utf-8")) 
      : [];
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    
    if (!approve) {
      list[idx].status = "rejected";
      fs.writeFileSync(pendingFile, JSON.stringify(list, null, 2));
      return res.json({ success: true });
    }

    // Mark as approved for now
    list[idx].status = "approved";
    fs.writeFileSync(pendingFile, JSON.stringify(list, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error("Manager Decide Transfer Error ❌:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
