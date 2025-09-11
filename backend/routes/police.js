import express from "express";
import dbPromise from "../db.js";
import { decrypt, hashDataSHA256 } from "../../utils/cryptoUtils.js"; // ✅ Fixed import
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/police/user/:id
 */
router.get("/user/:id", verifyToken, requireRole("police"), async (req, res) => {
  try {
    const db = await dbPromise;
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.params.id]);

    if (!user) return res.status(404).json({ error: "User not found" });

    let aadhaarPassport = null;
    try {
      aadhaarPassport = user.aadhaarPassport ? decrypt(user.aadhaarPassport) : null;
    } catch (err) {
      console.warn("Decrypt Aadhaar/Passport failed:", err.message);
    }

    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      aadhaarPassport,
      tripStartDate: user.tripStartDate,
      tripEndDate: user.tripEndDate,
      itinerary: user.itinerary,
      emergencyContacts: user.emergencyContacts,
      kycImagePath: user.kycImagePath,
      digitalIdHash: user.digitalIdHash,
      safetyScore: user.safetyScore,
    };

    return res.json({ ok: true, user: response });
  } catch (err) {
    console.error("Police /user/:id error:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

/**
 * GET /api/police/all
 */
router.get("/all", verifyToken, requireRole("police"), async (req, res) => {
  try {
    const db = await dbPromise;
    const users = await db.all(
      "SELECT id, name, phone, tripStartDate, tripEndDate, safetyScore FROM users"
    );
    return res.json({ ok: true, users });
  } catch (err) {
    console.error("Police /all error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
