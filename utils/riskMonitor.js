import axios from "axios";
import { speak } from "./textToSpeech.js";
import { initSpeech, startListening, stopListening } from "./speechToText.js";
import { sendSOS } from "./sendSOS.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

let monitoringInterval: NodeJS.Timer | null = null;

export function startRiskMonitor(userId: string) {
  console.log("✅ Risk monitor started");

  // Initialize voice recognition
  initSpeech(
    (results) => {
      const text = results[0]?.toLowerCase();
      if (text?.includes("help")) {
        void sendSOSWithRetry(userId, "User requested help via voice command.");
      }
    },
    (err) => console.error("Speech error:", err)
  );

  // Run risk check every 30 seconds
  monitoringInterval = setInterval(async () => {
    try {
      // Replace with real data
      const res = await axios.post("http://YOUR_SERVER/api/score", {
        userId,
        crimeRate: 70,
        touristRisk: true,
        roadSafety: 40,
        isStandingStill: false,
        routeDeviation: false,
      });

      const score = res.data.score;
      console.log("📊 Current Safety Score:", score);

      if (score < 40) {
        // Speak alert
        speak("Warning! Your safety risk is high. Do you need help?");
        // Start listening for "help" for 8 seconds
        await startListening();
        setTimeout(stopListening, 8000);
      }
    } catch (err) {
      console.error("Risk check failed:", err);
    }
  }, 30000);
}

export function stopRiskMonitor() {
  if (monitoringInterval) clearInterval(monitoringInterval);
  console.log("⏹️ Risk monitor stopped");
}

// 🔁 Retry-capable SOS sender
export async function sendSOSWithRetry(userId: string, message: string) {
  try {
    await sendSOS(userId, message);
  } catch (err) {
    console.warn("Failed to send SOS online, saving offline...", err);

    const payload = { userId, message, timestamp: Date.now() };
    const key = `offline_sos_${payload.timestamp}`;

    try {
      await AsyncStorage.setItem(key, JSON.stringify(payload));
      console.log(`💾 SOS saved offline as ${key}`);
    } catch (e) {
      console.error("❌ Failed to save offline SOS:", e);
    }
  }
}

// 🔄 Optional: Retry all offline SOS events
export async function retryOfflineSOS() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineSOSKeys = keys.filter((k) => k.startsWith("offline_sos_"));

    for (const key of offlineSOSKeys) {
      const json = await AsyncStorage.getItem(key);
      if (!json) continue;

      const data = JSON.parse(json);
      try {
        await sendSOS(data.userId, data.message);
        await AsyncStorage.removeItem(key);
        console.log("✅ Offline SOS sent and removed:", key);
      } catch (err) {
        console.warn("⚠️ Still offline, will retry later:", key);
      }
    }
  } catch (err) {
    console.error("retryOfflineSOS error:", err);
  }
}
