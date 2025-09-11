// models/Alert.js
import dbPromise from "../db.js";

// Add a new panic alert
export async function createAlert(userId, message, location) {
  const db = await dbPromise;
  const result = await db.run(
    `INSERT INTO alerts (userId, message, location) VALUES (?, ?, ?)`,
    [userId, message, location]
  );
  return { id: result.lastID, userId, message, location };
}

// Get all alerts
export async function getAllAlerts() {
  const db = await dbPromise;
  return db.all(`SELECT * FROM alerts ORDER BY timestamp DESC`);
}

// Get alerts for a specific user
export async function getUserAlerts(userId) {
  const db = await dbPromise;
  return db.all(`SELECT * FROM alerts WHERE userId = ? ORDER BY timestamp DESC`, [userId]);
}
