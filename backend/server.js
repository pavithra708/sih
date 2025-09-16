// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// Routes
import authRoutes from "./routes/auth.js";
import alertRoutes from "./routes/alerts.js";
import contactRoutes from "./routes/contacts.js";
import policeRoutes from "./routes/police.js";
import sosRoutes from "./routes/sos.js";
import crimeRoutes from "./routes/crime.js";
import placesRoutes from "./routes/places.js";
import roadsRoutes from "./routes/roads.js";
import feedbackRoutes from "./routes/feedback.js";
import riskRoutes from "./routes/risk.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ attach Socket.IO to server
const io = new Server(server, {
  cors: { origin: "*" },
});

// middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// inject io into routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// routes
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

app.get("/", (req, res) => res.send("✅ Guardian Backend is running!"));

// socket events
io.on("connection", (socket) => {
  console.log("👮 Police dashboard connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("❌ Police dashboard disconnected:", socket.id)
  );
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
