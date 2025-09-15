// backend/services/zoneHandler.js
import dbPromise from "../db.js";
import { sendSOS } from "../routes/sos.js"; // reuse SOS trigger
import textToSpeech from "../utils/tts.js"; // custom helper for voice prompt
import speechToText from "../utils/stt.js"; // custom helper for user response

/**
 * Periodic Zone Handler
 * Runs every 30s per user
 */
export async function checkZones() {
  const db = await dbPromise;
  const users = await db.all(`SELECT * FROM users`);

  for (const user of users) {
    const score = user.safetyScore || 100;

    if (score <= 30) {
      // ✅ Green zone - do nothing
      console.log(`🟢 User ${user.id} is safe`);
    } 
    else if (score > 30 && score <= 80) {
      // ⚠️ Yellow zone
      console.log(`🟡 User ${user.id} in warning zone`);
      await handleYellowZone(user);
    } 
    else if (score > 80) {
      // 🔴 Red zone
      console.log(`🔴 User ${user.id} in danger zone`);
      await handleRedZone(user);
    }
  }
}

/**
 * Yellow Zone - ask if safe
 */
async function handleYellowZone(user) {
  // Ask user via voice
  await textToSpeech(user.id, "Are you safe? Please say Yes or No.");

  const response = await speechToText(user.id, { timeout: 10_000 });

  if (response?.toLowerCase().includes("yes")) {
    console.log("✅ User confirmed safe, resetting score");
    const db = await dbPromise;
    await db.run(`UPDATE users SET safetyScore = 100 WHERE id = ?`, [user.id]);
  } else if (response?.toLowerCase().includes("no")) {
    console.log("🚨 User NOT safe, sending SOS");
    await sendSOS(user.id, "Yellow zone confirmation - user unsafe");
  } else {
    console.log("⏳ No valid response, keeping in Yellow zone");
  }
}

/**
 * Red Zone - immediate action if no response
 */
async function handleRedZone(user) {
  await textToSpeech(user.id, "Critical Alert. Are you safe? Say Yes or No.");

  const response = await speechToText(user.id, { timeout: 10_000 });

  if (response?.toLowerCase().includes("yes")) {
    console.log("✅ User confirmed safe, resetting score");
    const db = await dbPromise;
    await db.run(`UPDATE users SET safetyScore = 100 WHERE id = ?`, [user.id]);
  } else {
    console.log("🚨 User unsafe or no response, auto SOS");
    await sendSOS(user.id, "Red zone - no response or unsafe");
  }
}

// Run every 30 seconds
setInterval(checkZones, 30_000);
