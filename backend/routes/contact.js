import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinaryConfig.js";
import getSignedPdfUrl from "../config/signedUrl.js";
import Contact from "../models/contactSchema.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/", upload.single("cv"), async (req, res) => {
  try {
    const updateFields = req.body; // telefon, mail etc.

    // Hämta kontakt
    const contact = await Contact.findOne();
    if (!contact)
      return res.status(404).json({ message: "Ingen kontakt hittad" });

    // === Hantera CV ===
    if (req.file) {
      // Om tidigare CV finns: ta bort från Cloudinary
      if (contact.cv && contact.cv_public_id) {
        await cloudinary.uploader.destroy(contact.cv_public_id, {
          resource_type: "raw",
        });
      }

      // Ladda upp nytt CV
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "cv",
              public_id: `Josefine_ostlund_CV_2025_${Date.now()}`,
              access_mode: "public",
              use_filename: true,
              unique_filename: false,
              overwrite: true,
            },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      // Lägg in ny URL + public_id
      updateFields.cv = result.secure_url;
      updateFields.cv_public_id = getSignedPdfUrl(result.public_id);
    }

    // Uppdatera kontakt
    const updated = await Contact.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Error in PATCH /contact:", err);
    res
      .status(500)
      .json({ message: "Något gick fel vid uppdatering av kontakt." });
  }
});

export default router;
