// backend/server/routes/risk.js
import express from "express";
import dbPromise from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, lat, lon, isStandingStill = false, routeDeviation = false } = req.body;
    if (!userId || lat == null || lon == null) return res.status(400).json({ error: "userId, lat & lon required" });

    const db = await dbPromise;

    // Dynamic weights
    const weights = await db.get(`SELECT * FROM risk_weights WHERE id = 1`);
    const crimeWeight = weights?.crimeWeight || 1.0;
    const roadWeight = weights?.roadWeight || 1.0;
    const touristWeight = weights?.touristWeight || 1.0;

    // 1. Nearest city
    const cityRow = await db.get(
      `SELECT state, city FROM cities
       ORDER BY ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) ASC LIMIT 1`,
      [lat, lat, lon, lon]
    );
    const state = cityRow?.state || "Unknown";

    // 2. Crime rate
    const crimeRow = await db.get(`SELECT crimeRate FROM crime_data WHERE state = ?`, [state]);
    const crimeRate = crimeRow ? crimeRow.crimeRate : 0;

    // 3. Tourist hotspot
    const hotspotRow = await db.get(
      `SELECT risk, lat as hLat, lon as hLon, radius 
       FROM tourist_hotspots ORDER BY ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) ASC LIMIT 1`,
      [lat, lat, lon, lon]
    );
    let touristRisk = false;
    if (hotspotRow) {
      const distSq = (lat - hotspotRow.hLat) ** 2 + (lon - hotspotRow.hLon) ** 2;
      touristRisk = distSq <= hotspotRow.radius ** 2 && hotspotRow.risk === "high";
    }

    // 4. Nearest road safety
    const roadRow = await db.get(
      `SELECT safetyScore FROM roads ORDER BY ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) ASC LIMIT 1`,
      [lat, lat, lon, lon]
    );
    const roadSafety = roadRow ? roadRow.safetyScore : 100;

    // 5. Compute final score with dynamic weights
    let score = 100;
    score -= Math.min(50, crimeRate / 2) * crimeWeight;
    score -= touristRisk ? 10 * touristWeight : 0;
    score -= roadSafety < 50 ? 15 * roadWeight : 0;
    score -= isStandingStill ? 5 : 0;
    score -= routeDeviation ? 10 : 0;
    score = Math.max(0, Math.min(100, score));

    await db.run(`UPDATE users SET safetyScore = ? WHERE id = ?`, [score, userId]);
    const zone = score > 70 ? "Green" : score > 40 ? "Yellow" : "Red";

    res.json({
      ok: true,
      userId,
      location: { lat, lon },
      city: cityRow?.city || "Unknown",
      state,
      crimeRate,
      touristRisk,
      roadSafety,
      isStandingStill,
      routeDeviation,
      finalSafetyScore: score,
      zone
    });
  } catch (err) {
    console.error("Risk route error:", err);
    res.status(500).json({ error: "Failed to calculate risk" });
  }
});

export default router;
