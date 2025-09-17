import dotenv from "dotenv";
dotenv.config(); // Must be first

import mongoose from "mongoose";

console.log("Mongo URI:", process.env.MONGO_URI); // debug

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

export default mongoose;
