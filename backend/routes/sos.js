import express from "express";
import dbPromise from "../db.js";

const router = express.Router();

// Create SOS alert and send full user details to police dashboard
router.post("/", async (req, res) => {
  try {
    const db = await dbPromise;
    const {
      score,
      reason,
      location,
      blockHash,
      prevHash,
      audioFile,
      videoFile,
      userId,
    } = req.body;

    // 1️⃣ Save basic alert in DB
    const result = await db.run(
      `INSERT INTO alerts (userId, message, location, blockchainHash) VALUES (?, ?, ?, ?)`,
      [userId, reason, JSON.stringify(location), blockHash]
    );

    // 2️⃣ Fetch full user details for police dashboard
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    // 3️⃣ Build full SOS payload
    const sosData = {
      id: result.lastID,
      userId,
      reason,
      location,
      score,
      blockHash,
      prevHash,
      audioFile: audioFile || null,
      videoFile: videoFile || null,
      userProfile: {
        name: user.name,
        phone: user.phone,
        emergencyContacts: user.emergencyContacts, // JSON array or string
        digitalId: user.aadhaarPassport || user.digitalIdHash,
      },
      timestamp: new Date().toISOString(),
    };

    // 4️⃣ Emit to all police dashboards via socket.io
    req.io.emit("new_sos", sosData);

    // 5️⃣ Return success
    res.json({ success: true, sosData });
  } catch (err) {
    console.error("❌ Failed to save SOS:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
