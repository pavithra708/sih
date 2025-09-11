// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import alertRoutes from "./routes/alerts.js";
import contactRoutes from "./routes/contacts.js";
import policeRoutes from "./routes/police.js";
import sosRoutes from "./routes/sos.js"; // ✅ add SOS

dotenv.config(); // ✅ load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/sos", sosRoutes);

app.get("/", (req, res) => {
  res.send("✅ Guardian Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
