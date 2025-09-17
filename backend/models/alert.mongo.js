import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  location: { type: Object }, // { latitude, longitude, timestamp }
  score: { type: Number, default: 0 },
  blockHash: { type: String },
  prevHash: { type: String },
  audioFile: { type: String, default: null },
  videoFile: { type: String, default: null },
  userProfile: {
    name: String,
    phone: String,
    emergencyContacts: [String],
    digitalId: String,
  },
  timestamp: { type: Date, default: Date.now },
});

const AlertMongo = mongoose.model("Alert", alertSchema);
export default AlertMongo;
