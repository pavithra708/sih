import express from "express";
import dbPromise from "../db.js"; 
import AlertMongo from "../models/alert.mongo.js";

const router = express.Router();

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

    if (!userId || !reason) return res.status(400).json({ error: "userId and reason required" });

    // Save in SQLite
    const result = await db.run(
      `INSERT INTO alerts (userId, message, location, blockchainHash) VALUES (?, ?, ?, ?)`,
      [userId, reason, JSON.stringify(location), blockHash]
    );

    // Fetch full user details
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Build full payload
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
        emergencyContacts: Array.isArray(user.emergencyContacts) 
          ? user.emergencyContacts 
          : [user.emergencyContacts],
        digitalId: user.aadhaarPassport || user.digitalIdHash,
      },
      timestamp: new Date().toISOString(),
    };

    // Save **entire payload** in MongoDB
    const mongoAlert = new AlertMongo(sosData);
    await mongoAlert.save();

    console.log("✅ SOS sent successfully:", sosData); // logs same as mobile app

    // Emit to police dashboard
    req.io.emit("new_sos", sosData);

    res.status(201).json({ success: true, sosData });
  } catch (err) {
    console.error("❌ Failed to save SOS:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
