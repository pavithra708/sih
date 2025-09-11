import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/kyc-verify", upload.single("kycImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const formData = new FormData();
    formData.append("apikey", process.env.OCR_SPACE_API_KEY);
    formData.append("file", fs.createReadStream(req.file.path));
    formData.append("language", "eng");

    const response = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: formData });
    const data = await response.json();

    if (!data?.ParsedResults) return res.status(400).json({ error: "OCR failed" });

    const parsedText = data.ParsedResults[0].ParsedText;
    const aadhaarMatch = parsedText.match(/\d{4}\s\d{4}\s\d{4}/);
    const passportMatch = parsedText.match(/[A-Z]\d{7}/);

    return res.json({
      text: parsedText,
      aadhaar: aadhaarMatch ? aadhaarMatch[0] : null,
      passport: passportMatch ? passportMatch[0] : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "KYC verification failed" });
  }
});

export default router;
