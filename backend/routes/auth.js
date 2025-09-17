import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { registerTourist, findTouristByEmail } from "../models/Tourist.js";
import { encrypt } from "../../utils/cryptoUtils.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * ✅ Utility: safe JSON parse
 */
function safeParse(data, fallback = []) {
  try {
    if (!data) return fallback;
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    if (typeof data === "object") {
      return data;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * ✅ Dummy KYC verification endpoint
 */
router.post("/kyc-verify", upload.single("kycImage"), async (req, res) => {
  try {
    const dummyKYC = {
      name: "John Doe",
      aadhaar: "1234-5678-9012",
      passport: "X1234567",
    };
    res.json({ ok: true, ...dummyKYC });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "KYC verification failed" });
  }
});

/**
 * ✅ Registration endpoint
 */
router.post("/register-multipart", upload.single("kycImage"), async (req, res) => {
  try {
    const body = req.body;

    // Hash password before saving
    const passwordHash = body.password
      ? await bcrypt.hash(body.password, 10)
      : null;

    const tourist = {
      name: body.name,
      email: body.email,
      password: passwordHash,
      phone: body.phone,
      aadhaarPassport: body.aadhaarPassport
        ? encrypt(body.aadhaarPassport)
        : body.detectedAadhaar
        ? encrypt(body.detectedAadhaar)
        : body.detectedPassport
        ? encrypt(body.detectedPassport)
        : null,
      itinerary: safeParse(body.itinerary, []),            // ✅ safe parse
      tripStartDate: body.tripStartDate,
      tripEndDate: body.tripEndDate,
      emergencyContacts: safeParse(body.emergencyContacts, []), // ✅ safe parse
      kycImagePath: req.file ? req.file.path : null,
      publicKey: body.publicKey || null,
      encryptedPrivateKey: body.encryptedPrivateKey || null,
      digitalIdHash: body.digitalIdHash || null,
      digitalIdJson: { ...body, kycImagePath: req.file?.path },
    };

    const newUser = await registerTourist(tourist);

    return res.json({
      ok: true,
      user: {
        ...newUser,
        itinerary: safeParse(newUser.itinerary, []),
        emergencyContacts: safeParse(newUser.emergencyContacts, []),
      },
      token: "dummy-token",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ ok: false, error: err.message || "Registration failed" });
  }
});

/**
 * ✅ Login endpoint
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const tourist = await findTouristByEmail(email);
    if (!tourist) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    const valid = await bcrypt.compare(password, tourist.password);
    if (!valid) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    return res.json({
      ok: true,
      user: {
        id: tourist.id,
        name: tourist.name,
        email: tourist.email,
        itinerary: safeParse(tourist.itinerary, []),            // ✅ safe parse
        emergencyContacts: safeParse(tourist.emergencyContacts, []), // ✅ safe parse
      },
      token: "dummy-token",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Login failed" });
  }
});

export default router;
