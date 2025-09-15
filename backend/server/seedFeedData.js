// backend/server/seedFeedData.js
import dbPromise from "../db.js";

async function seed() {
  try {
    const db = await dbPromise;

    // 1️⃣ Feedback table
    await db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alertId TEXT NOT NULL,
        userId TEXT NOT NULL,
        valid INTEGER NOT NULL,       -- 1 = true, 0 = false
        notes TEXT,
        sendToPolice INTEGER DEFAULT 0,
        processed INTEGER DEFAULT 0,  -- feedback processed for model update
        ts INTEGER
      )
    `);

    // 2️⃣ Police alerts table
    await db.run(`
      CREATE TABLE IF NOT EXISTS police_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        alertId TEXT NOT NULL,
        userId TEXT NOT NULL,
        location TEXT,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        ts INTEGER
      )
    `);

    // 3️⃣ Risk weights table for dynamic scoring
    await db.run(`
      CREATE TABLE IF NOT EXISTS risk_weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crimeWeight REAL DEFAULT 1.0,
        roadWeight REAL DEFAULT 1.0,
        touristWeight REAL DEFAULT 1.0
      )
    `);

    // Insert default weights if table is empty
    const row = await db.get(`SELECT * FROM risk_weights WHERE id=1`);
    if (!row) {
      await db.run(
        `INSERT INTO risk_weights (crimeWeight, roadWeight, touristWeight) VALUES (1.0, 1.0, 1.0)`
      );
    }

    console.log("✅ Feedback and risk tables seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

// Run seed
seed();
