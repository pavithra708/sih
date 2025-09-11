// routes/contacts.js
import express from "express";
import { addContact, getContacts } from "../models/contact.js";

const router = express.Router();

// Add new contact
router.post("/", async (req, res) => {
  try {
    const { userId, name, phone } = req.body;
    const contact = await addContact(userId, name, phone);
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// Get all contacts of a user
router.get("/:userId", async (req, res) => {
  try {
    const contacts = await getContacts(req.params.userId);
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

export default router;
