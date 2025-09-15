import axios from "axios";

// Replace with your backend URL
const BASE_URL = "http://YOUR_SERVER/api";

export async function sendSOS(userId: string, message: string) {
  const payload = {
    userId,
    message,
    timestamp: Date.now(),
  };

  try {
    // Send to backend API
    await axios.post(`${BASE_URL}/sos/trigger`, payload);
    console.log("🚨 SOS sent to server:", payload);
  } catch (err) {
    console.error("❌ SOS failed, storing offline:", err);

    // Fallback: save offline
    try {
      const key = `offline_sos_${payload.timestamp}.json`;
      await saveOfflineData(key, payload);
      console.log(`💾 SOS saved offline as ${key}`);
    } catch (e) {
      console.error("❌ Failed to save offline SOS:", e);
    }
  }
}

// Helper: offline storage (AsyncStorage)
import AsyncStorage from "@react-native-async-storage/async-storage";
async function saveOfflineData(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("❌ saveOfflineData error:", err);
  }
}
