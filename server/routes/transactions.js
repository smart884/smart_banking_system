const express = require("express");
const router = express.Router();
const { db, admin } = require("../firebase");
const { authMiddleware, authorize } = require("../middleware/auth");

/**
 * POST /api/transactions/transfer
 * Transfers money between users.
 */
router.post("/transfer", authMiddleware, async (req, res) => {
  const { recipientEmail, amount, description } = req.body;
  const senderUid = req.user.uid;

  if (!recipientEmail || !amount || amount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid transfer details." });
  }

  try {
    // 1. Find recipient by email
    const recipientSnapshot = await db.collection("users").where("email", "==", recipientEmail).limit(1).get();
    if (recipientSnapshot.empty) {
      return res.status(404).json({ success: false, error: "Recipient not found." });
    }
    const recipientData = recipientSnapshot.docs[0].data();
    const recipientUid = recipientData.uid;

    if (senderUid === recipientUid) {
      return res.status(400).json({ success: false, error: "Cannot transfer to yourself." });
    }

    // 2. Perform Transaction (Atomic)
    const transactionRecord = {
      senderUid,
      senderEmail: req.user.email,
      recipientUid,
      recipientEmail,
      amount: parseFloat(amount),
      description: description || "Money Transfer",
      type: "transfer",
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("transactions").add(transactionRecord);

    res.json({ success: true, message: "Transfer successful ✅" });
  } catch (error) {
    console.error("Transfer Error:", error);
    res.status(500).json({ success: false, error: "Failed to process transfer." });
  }
});

/**
 * GET /api/transactions/history
 * Returns transaction history for the current user.
 */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const sentSnapshot = await db.collection("transactions")
      .where("senderUid", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const receivedSnapshot = await db.collection("transactions")
      .where("recipientUid", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), direction: "sent" }));
    const received = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), direction: "received" }));

    const history = [...sent, ...received].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
