// backend/models/Tourist.js
import dbPromise from "../db.js";

/**
 * ✅ Register a new tourist
 */
export async function registerTourist(tourist) {
  const db = await dbPromise;
  const result = await db.run(
    `INSERT INTO users (
      name,
      email,
      password,
      phone,
      publicKey,
      privateKey,
      aadhaarPassport,
      itinerary,
      tripStartDate,
      tripEndDate,
      emergencyContacts,
      kycImagePath,
      digitalIdJson,
      digitalIdHash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tourist.name,
      tourist.email,
      tourist.password, // ✅ always use "password" (hashed)
      tourist.phone || null,
      tourist.publicKey || null,
      tourist.encryptedPrivateKey || null,
      tourist.aadhaarPassport || null,
      tourist.itinerary || null,
      tourist.tripStartDate || null,
      tourist.tripEndDate || null,
      tourist.emergencyContacts || null,
      tourist.kycImagePath || null,
      JSON.stringify(tourist.digitalIdJson || {}),
      tourist.digitalIdHash || null,
    ]
  );

  return {
    id: result.lastID,
    name: tourist.name,
    email: tourist.email,
  };
}

/**
 * ✅ Find tourist by email (used for login)
 */
export async function findTouristByEmail(email) {
  const db = await dbPromise;
  return db.get(`SELECT * FROM users WHERE email = ?`, [email]);
}

/**
 * ✅ Get tourist by ID
 */
export async function getTouristById(id) {
  const db = await dbPromise;
  return db.get(`SELECT * FROM users WHERE id = ?`, [id]);
}

/**
 * ✅ Update tourist by ID (partial update)
 */
export async function updateTouristById(id, updates) {
  const db = await dbPromise;
  const keys = Object.keys(updates);
  if (!keys.length) return getTouristById(id);

  const values = keys.map((k) => updates[k]);
  const set = keys.map((k) => `${k} = ?`).join(", ");

  await db.run(`UPDATE users SET ${set} WHERE id = ?`, [...values, id]);
  return getTouristById(id);
}
