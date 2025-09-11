// models/Contact.js
import dbPromise from "../db.js";

export async function addContact(userId, name, phone) {
  const db = await dbPromise;
  const result = await db.run(
    `INSERT INTO contacts (userId, name, phone) VALUES (?, ?, ?)`,
    [userId, name, phone]
  );
  return { id: result.lastID, userId, name, phone };
}

export async function getContacts(userId) {
  const db = await dbPromise;
  return db.all(`SELECT * FROM contacts WHERE userId = ?`, [userId]);
}
