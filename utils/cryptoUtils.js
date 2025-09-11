// backend/utils/cryptoUtils.js
import crypto from "crypto";
import SHA256 from "crypto-js/sha256.js";

// ==========================
// RSA Key Pair Generation
// ==========================
export function generateKeyPairPEM() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

// ==========================
// Private Key Encryption
// ==========================
export function encryptPrivateKey(privateKeyPem, passwordHash) {
  const key = crypto.createHash("sha256").update(passwordHash).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(privateKeyPem, "utf8", "base64");
  encrypted += cipher.final("base64");
  return iv.toString("base64") + ":" + encrypted;
}

export function decryptPrivateKey(encrypted, passwordHash) {
  const key = crypto.createHash("sha256").update(passwordHash).digest();
  const [ivB64, encryptedB64] = encrypted.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedB64, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// ==========================
// SHA256 Hashing
// ==========================
export function hashDataSHA256(data) {
  return SHA256(JSON.stringify(data)).toString();
}

// ==========================
// Aadhaar/Passport Encryption
// ==========================
const ALGO = "aes-256-cbc";

// Load key from .env, fallback to random for dev
const SECRET_KEY_HEX = process.env.ENCRYPTION_KEY; // must be 32 bytes hex
if (!SECRET_KEY_HEX) {
  console.warn(
    "[cryptoUtils] ENCRYPTION_KEY not set in .env, using random key (dev only)"
  );
}
const SECRET_KEY = SECRET_KEY_HEX
  ? Buffer.from(SECRET_KEY_HEX, "hex")
  : crypto.randomBytes(32);

/**
 * Encrypt sensitive text (Aadhaar / Passport)
 * @param {string} text
 * @returns {string} IV + ciphertext (hex)
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt sensitive text
 * @param {string} text IV + ciphertext (hex)
 * @returns {string} decrypted text
 */
export function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, SECRET_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
