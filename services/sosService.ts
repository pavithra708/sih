// services/sosService.ts
import * as Crypto from "expo-crypto";
import { Alert } from "react-native";

const SOS_API = "http://192.168.19.170:5000/api/sos"; // matches your backend
let lastBlockHash = "GENESIS";

// 🔹 Create blockchain record
const createBlockchainRecord = async (data: any) => {
  const json = JSON.stringify(data);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    lastBlockHash + json
  );
  const prevHash = lastBlockHash;
  lastBlockHash = hash;
  return { ...data, blockHash: hash, prevHash };
};

// 🔹 Trigger SOS
export const triggerSOS = async (
  userId: number,
  score: number,
  reason: string,
  location: { latitude: number; longitude: number }
) => {
  // Only basic info from frontend
  const sosData = { userId, timestamp: Date.now(), score, reason, location };

  try {
    // Add blockchain info
    const block = await createBlockchainRecord(sosData);

    // Send to backend
    const res = await fetch(SOS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(block),
    });

    const resJson = await res.json();

    if (!res.ok || !resJson.success) {
      throw new Error(resJson.message || `HTTP ${res.status}`);
    }

    console.log("✅ SOS sent successfully:", resJson.sosData);
    Alert.alert(
      "🚨 SOS Triggered",
      `Alert sent securely!\n\nData:\n${JSON.stringify(resJson.sosData, null, 2)}`
    );

    return resJson.sosData; // includes full userProfile from backend
  } catch (err: any) {
    console.error("❌ SOS failed:", err);
    Alert.alert("❌ SOS Failed", err.message || "Unknown error");
    throw err;
  }
};
