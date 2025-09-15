// backend/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPromise = open({
  filename: "./database.sqlite",
  driver: sqlite3.Database,
});

export async function initDB() {
  const db = await dbPromise;

  // ✅ Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT NOT NULL,
      aadhaarPassport TEXT, -- encrypted Aadhaar/Passport
      tripStartDate TEXT,
      tripEndDate TEXT,
      itinerary TEXT,
      emergencyContacts TEXT,
      kycImagePath TEXT,
      digitalIdJson TEXT,   -- JSON string of digital identity
      digitalIdHash TEXT,   -- SHA256 hash of digital identity
      safetyScore INTEGER DEFAULT 100,
      publicKey TEXT,
      privateKey TEXT       -- 🔒 must be encrypted before saving
    )
  `);

  // ✅ Indexes
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`);

  // ✅ Alerts table (FIXED: added blockchainHash, policeFeedback, createdAt)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      message TEXT NOT NULL,
      location TEXT,
      blockchainHash TEXT,
      policeFeedback TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // ✅ Contacts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      relationship TEXT,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ Database initialized with secure schema");
}

// Run init only if executed directly
if (process.env.NODE_ENV !== "test") {
  initDB().catch((err) => {
    console.error("❌ Failed to init DB:", err);
    process.exit(1);
  });
}

export default dbPromise;
