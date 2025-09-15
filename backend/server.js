// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth.js";
import alertRoutes from "./routes/alerts.js";
import contactRoutes from "./routes/contacts.js";
import policeRoutes from "./routes/police.js";
import sosRoutes from "./routes/sos.js";
import crimeRoutes from "./routes/crime.js";
import placesRoutes from "./routes/places.js";
import roadsRoutes from "./routes/roads.js";
import feedbackRoutes from "./routes/feedback.js"; // unified feedback
import riskRoutes from "./routes/risk.js";          // fixed

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/crime", crimeRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/roads", roadsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/risk", riskRoutes);

// Root
app.get("/", (req, res) => res.send("✅ Guardian Backend is running!"));

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
