// routes/alerts.js
import express from "express";
import { createAlert, getAllAlerts, getUserAlerts } from "../models/Alert.js";

const router = express.Router();

// Create new alert
router.post("/", async (req, res) => {
  try {
    const { userId, message, location } = req.body;
    const alert = await createAlert(userId, message, location);
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: "Failed to create alert" });
  }
});

// Get all alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await getAllAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

// Get alerts for one user
router.get("/user/:id", async (req, res) => {
  try {
    const alerts = await getUserAlerts(req.params.id);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user alerts" });
  }
});

export default router;
