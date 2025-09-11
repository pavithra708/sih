import express from "express";
import dbPromise from "../db.js";
import { decrypt, hashDataSHA256 } from "../../utils/cryptoUtils.js"; // ✅ Fixed import
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/sos/trigger
 */
router.post("/trigger", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, message } = req.body;

    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ error: "User not found" });

    let aadhaarPassport = null;
    try {
      aadhaarPassport = user.aadhaarPassport ? decrypt(user.aadhaarPassport) : null;
    } catch (err) {
      console.warn("Decrypt Aadhaar/Passport failed:", err.message);
    }

    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      aadhaarPassport,
      tripStartDate: user.tripStartDate,
      tripEndDate: user.tripEndDate,
      itinerary: user.itinerary,
      emergencyContacts: user.emergencyContacts,
      location: location || null,
      message: message || "SOS triggered",
    };

    await db.run(
      "INSERT INTO alerts (userId, message, location) VALUES (?, ?, ?)",
      [user.id, payload.message, payload.location]
    );

    res.json({ ok: true, msg: "SOS forwarded to authorities", payload });
  } catch (err) {
    console.error("SOS trigger error:", err);
    res.status(500).json({ error: "Failed to trigger SOS" });
  }
});

export default router;
