// routes/score.js
import express from "express";
import dbPromise from "../db.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Calculate real-time safety score
 * Uses local DB (crime, roads, places, movement patterns)
 */
router.post("/score", verifyToken, async (req, res) => {
  try {
    const { userId, lat, lon, isStandingStill = false, routeDeviation = false } = req.body;
    if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });

    const db = await dbPromise;

    // 1. Nearest city → state
    const cityRow = await db.get(
      `SELECT state, city FROM cities
       ORDER BY ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) ASC
       LIMIT 1`,
      [lat, lat, lon, lon]
    );
    const state = cityRow?.state;

    // 2. Crime data
    const crimeRow = await db.get(
      `SELECT crimeRate FROM crime_data WHERE state = ?`,
      [state]
    );
    const crimeRate = crimeRow ? crimeRow.crimeRate : 0;

    // 3. Tourist hotspot risk
    const hotspot = await db.get(
      `SELECT risk FROM tourist_hotspots
       WHERE ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) <= (radius * radius)
       LIMIT 1`,
      [lat, lat, lon, lon]
    );
    const touristRisk = hotspot ? hotspot.risk === "high" : false;

    // 4. Road safety near user
    const roadRow = await db.get(
      `SELECT safetyScore FROM roads
       ORDER BY ((lat - ?) * (lat - ?) + (lon - ?) * (lon - ?)) ASC
       LIMIT 1`,
      [lat, lat, lon, lon]
    );
    const roadSafety = roadRow ? roadRow.safetyScore : 100;

    // 5. Risk calculation
    let score = 100;
    score -= Math.min(50, crimeRate / 2);   // high crime reduces score
    score -= touristRisk ? 10 : 0;          // risky tourist area
    score -= roadSafety < 50 ? 15 : 0;      // poor road condition
    score -= isStandingStill ? 5 : 0;       // standing still too long
    score -= routeDeviation ? 10 : 0;       // deviated from safe route

    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Update user’s safety score
    await db.run(`UPDATE users SET safetyScore = ? WHERE id = ?`, [score, userId]);

    // Zone classification
    const zone = score > 70 ? "Green" : score > 40 ? "Yellow" : "Red";

    res.json({
      ok: true,
      userId,
      location: { lat, lon },
      city: cityRow?.city || "Unknown",
      state: state || "Unknown",
      crimeRate,
      touristRisk,
      roadSafety,
      isStandingStill,
      routeDeviation,
      finalSafetyScore: score,
      zone
    });

  } catch (err) {
    console.error("Risk scoring error:", err);
    res.status(500).json({ error: "Failed to calculate risk score" });
  }
});

export default router;
