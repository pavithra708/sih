// backend/server/routes/feedback.js
import express from "express";
import dbPromise from "../db.js";
import { processFeedback } from "../../services/feedbackProcessor.js";

const router = express.Router();

router.post("/submit", express.json(), async (req, res) => {
  try {
    const { alertId, valid, notes, userId } = req.body;
    if (!alertId || typeof valid !== "boolean" || !userId) {
      return res.status(400).json({ success: false, message: "alertId, userId and valid(boolean) required" });
    }

    const db = await dbPromise;

    // Store feedback
    await db.run(
      `INSERT INTO feedback (alertId, userId, valid, notes, ts) VALUES (?, ?, ?, ?, ?)`,
      [alertId, userId, valid ? 1 : 0, notes || null, Date.now()]
    );

    // Trigger feedback processing
    const result = await processFeedback();

    res.json({ success: true, processedFeedbackCount: result.updated });
  } catch (err) {
    console.error("Feedback route error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export default router;
