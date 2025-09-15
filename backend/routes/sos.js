import express from "express";
import dbPromise from "../db.js";
import { decrypt, hashDataSHA256 } from "../../utils/cryptoUtils.js";
import { verifyToken } from "../middleware/auth.js";
import { notifyEmergencyContacts, notifyPolice } from "../../services/notificationService.js";

const router = express.Router();

router.post("/trigger", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, message } = req.body;

    if (!location || !message) {
      return res.status(400).json({ error: "location and message required" });
    }

    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    let aadhaarPassport = null;
    try {
      aadhaarPassport = user.aadhaarPassport ? decrypt(user.aadhaarPassport) : null;
    } catch (err) {
      console.warn("Decrypt failed:", err.message);
    }

    // Insert alert
    const result = await db.run(
      "INSERT INTO alerts (userId, message, location, createdAt) VALUES (?, ?, ?, ?)",
      [user.id, message, JSON.stringify(location), new Date().toISOString()]
    );

    const alertId = result.lastID;
    const hash = hashDataSHA256(`${user.id}-${message}-${Date.now()}`);
    await db.run("UPDATE alerts SET blockchainHash = ? WHERE id = ?", [hash, alertId]);

    // Notify police
    await notifyPolice({
      alertId,
      userId,
      name: user.name,
      phone: user.phone,
      email: user.email,
      aadhaarPassport,
      tripStartDate: user.tripStartDate,
      tripEndDate: user.tripEndDate,
      itinerary: user.itinerary,
      emergencyContacts: user.emergencyContacts,
      location,
      message,
      blockchainHash: hash,
      createdAt: new Date().toISOString(),
    });

    // Notify emergency contacts
    let contacts = [];
    if (user.emergencyContacts) {
      try {
        contacts = JSON.parse(user.emergencyContacts); // should be array of { name, phone }
      } catch {
        contacts = [];
      }
    }
    await notifyEmergencyContacts(contacts, `⚠️ SOS alert from ${user.name}: ${message}`);

    res.json({
      ok: true,
      msg: "SOS stored, police & emergency contacts notified",
      alertId,
      blockchainHash: hash,
    });
  } catch (err) {
    console.error("SOS trigger error:", err);
    res.status(500).json({ error: "Failed to trigger SOS" });
  }
});

export default router;
