import express from "express";
import multer from "multer";
import { registerTourist } from "../models/Tourist.js";
import {
  encrypt,
  decrypt,
  hashDataSHA256,
} from "../../utils/cryptoUtils.js"; // ✅ Correct import

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Dummy KYC verification endpoint
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

// ✅ Registration endpoint
router.post("/register-multipart", upload.single("kycImage"), async (req, res) => {
  try {
    const body = req.body;

    const tourist = {
      name: body.name,
      email: body.email,
      passwordHash: body.password, // TODO: hash with bcrypt
      phone: body.phone,
      aadhaarPassport: body.aadhaarPassport
        ? encrypt(body.aadhaarPassport)
        : body.detectedAadhaar
        ? encrypt(body.detectedAadhaar)
        : body.detectedPassport
        ? encrypt(body.detectedPassport)
        : null,
      itinerary: body.itinerary || null,
      tripStartDate: body.tripStartDate,
      tripEndDate: body.tripEndDate,
      emergencyContacts: body.emergencyContacts,
      kycImagePath: req.file ? req.file.path : null,
      publicKey: body.publicKey || null,
      encryptedPrivateKey: body.encryptedPrivateKey || null,
      digitalIdHash: body.digitalIdHash || null,
      digitalIdJson: { ...body, kycImagePath: req.file?.path },
    };

    const newUser = await registerTourist(tourist);
    return res.json({ user: newUser, token: "dummy-token" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Registration failed" });
  }
});

export default router;
