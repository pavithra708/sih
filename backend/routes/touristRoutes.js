import express from "express";
import { openDb } from "../models/Tourist.js";

const router = express.Router();

// get all tourists
router.get("/", async (req, res) => {
  const db = await openDb();
  const tourists = await db.all("SELECT * FROM tourists");
  res.json(tourists);
});

// add tourist
router.post("/", async (req, res) => {
  const { id, name, phone, email, itinerary, tripEndDate } = req.body;
  const db = await openDb();
  await db.run(
    "INSERT OR REPLACE INTO tourists (id, name, phone, email, itinerary, tripEndDate) VALUES (?, ?, ?, ?, ?, ?)",
    [id, name, phone, email, JSON.stringify(itinerary), tripEndDate]
  );
  res.json({ message: "Tourist saved successfully" });
});

export default router;
