// routes/alerts.js
import express from "express";
import dbPromise from "../db.js";
import { hashDataSHA256 } from "../../utils/cryptoUtils.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Create new alert (manual / system)
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, message, location } = req.body;

    const db = await dbPromise;

    // Save alert
    const result = await db.run(
      "INSERT INTO alerts (userId, message, location) VALUES (?, ?, ?)",
      [userId, message, location]
    );

    // Blockchain hash
    const hash = hashDataSHA256(`${userId}-${message}-${location}-${Date.now()}`);
    await db.run(
      "UPDATE alerts SET blockchainHash = ? WHERE id = ?",
      [hash, result.lastID]
    );

    res.json({ id: result.lastID, userId, message, location, blockchainHash: hash });
  } catch (err) {
    console.error("Create alert error:", err);
    res.status(500).json({ error: "Failed to create alert" });
  }
});

/**
 * Get all alerts
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const alerts = await db.all("SELECT * FROM alerts ORDER BY createdAt DESC");
    res.json(alerts);
  } catch (err) {
    console.error("Fetch alerts error:", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

/**
 * Get alerts for one user
 */
router.get("/user/:id", verifyToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const alerts = await db.all(
      "SELECT * FROM alerts WHERE userId = ? ORDER BY createdAt DESC",
      [req.params.id]
    );
    res.json(alerts);
  } catch (err) {
    console.error("Fetch user alerts error:", err);
    res.status(500).json({ error: "Failed to fetch user alerts" });
  }
});

/**
 * Police feedback route
 */
router.post("/:id/feedback", verifyToken, async (req, res) => {
  try {
    const { isTruePositive } = req.body;
    const db = await dbPromise;

    await db.run(
      "UPDATE alerts SET policeFeedback = ? WHERE id = ?",
      [isTruePositive ? "true" : "false", req.params.id]
    );

    res.json({ ok: true, msg: "Feedback stored", isTruePositive });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: "Failed to store feedback" });
  }
});

export default router;
