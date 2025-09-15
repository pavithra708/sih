// server/controllers/feedback.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dbPromise from "../db.js"; // SQLite database

// __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.join(__dirname, "..", "data", "feedback_logs.json");

// Ensure data folder exists
const ensureLogFile = () => {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "[]", "utf8");
};

// Controller for feedback submission
export const submitFeedback = async (req, res) => {
  try {
    const { alertId, valid, notes } = req.body;
    if (!alertId || typeof valid !== "boolean") {
      return res.status(400).json({ success: false, message: "alertId and valid(boolean) required" });
    }

    ensureLogFile();

    // 1️⃣ Save to JSON
    const raw = fs.readFileSync(LOG_FILE, "utf8");
    const arr = JSON.parse(raw || "[]");
    const entry = { alertId, valid, notes: notes || null, ts: Date.now() };
    arr.push(entry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2), "utf8");

    // 2️⃣ Save to DB for police / AI improvement
    const db = await dbPromise;
    await db.run(
      `INSERT INTO feedback (alertId, isValid, notes, ts) VALUES (?, ?, ?, ?)`,
      [alertId, valid ? 1 : 0, notes || null, Date.now()]
    );

    // 3️⃣ Optional: Trigger police alert if valid = true
    if (valid) {
      await db.run(
        `UPDATE alerts SET sentToPolice = 1 WHERE id = ?`,
        [alertId]
      );
    }

    // 4️⃣ Optional: Update scoring weights or AI model (starter logic)
    // Example: if alert was true, increase weight for related features
    if (valid) {
      // Pseudo: increment crime weight for zone in risk_weights table
      await db.run(
        `UPDATE risk_weights SET weight = weight + 1 WHERE alertType = (SELECT type FROM alerts WHERE id = ?)`,
        [alertId]
      );
    }

    res.json({ success: true, entry });
  } catch (err) {
    console.error("Feedback controller error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
