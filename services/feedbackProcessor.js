// services/feedbackProcessor.js
import dbPromise from "../backend/db.js";

export async function processFeedback() {
  const db = await dbPromise;

  // 1️⃣ Fetch unprocessed feedback
  const feedbacks = await db.all(`SELECT * FROM feedback WHERE processed = 0`);
  if (!feedbacks.length) return { updated: 0 };

  let crimeAdjust = 0;
  let roadAdjust = 0;
  let touristAdjust = 0;

  for (const fb of feedbacks) {
    // Simple strategy: if feedback says alert is false, reduce weights slightly
    const factor = fb.valid ? 1 : -0.05;

    // For demo purposes, adjust each weight randomly
    crimeAdjust += factor * (Math.random() * 0.1);
    roadAdjust += factor * (Math.random() * 0.1);
    touristAdjust += factor * (Math.random() * 0.1);
  }

  // 2️⃣ Update risk_weights table
  const weights = await db.get(`SELECT * FROM risk_weights WHERE id = 1`);
  const newCrime = Math.max(0, weights.crimeWeight + crimeAdjust);
  const newRoad = Math.max(0, weights.roadWeight + roadAdjust);
  const newTourist = Math.max(0, weights.touristWeight + touristAdjust);

  await db.run(
    `UPDATE risk_weights 
     SET crimeWeight = ?, roadWeight = ?, touristWeight = ? 
     WHERE id = 1`,
    [newCrime, newRoad, newTourist]
  );

  // 3️⃣ Mark feedback as processed
  await db.run(`UPDATE feedback SET processed = 1 WHERE processed = 0`);

  return { updated: feedbacks.length };
}
