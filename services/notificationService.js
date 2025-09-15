// backend/server/services/notificationService.js
import axios from "axios";

/**
 * Send notifications to emergency contacts
 * @param {Array} contacts - array of { name, phone }
 * @param {String} message - message to send
 */
export async function notifyEmergencyContacts(contacts, message) {
  if (!contacts || contacts.length === 0) return;

  for (const contact of contacts) {
    try {
      // Example: Replace with actual SMS / WhatsApp / push API
      await axios.post("https://example-sms-api.com/send", {
        to: contact.phone,
        body: message,
      });
      console.log(`✅ Notified ${contact.name} at ${contact.phone}`);
    } catch (err) {
      console.error(`❌ Failed to notify ${contact.name}:`, err.message);
    }
  }
}

/**
 * Optional: notify police endpoint
 */
export async function notifyPolice(payload) {
  if (!process.env.POLICE_API_URL) return;
  try {
    await axios.post(`${process.env.POLICE_API_URL}/receive-alert`, payload);
    console.log("✅ Police notified for SOS alert");
  } catch (err) {
    console.error("❌ Failed to notify police:", err.message);
  }
}
