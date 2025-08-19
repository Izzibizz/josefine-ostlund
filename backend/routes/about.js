import express from "express";
import About from "../models/aboutSchema.js";
import cloudinary from "../config/cloudinaryConfig.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/", upload.single("image"), async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About ej hittad" });

    // Hantera bilduppdatering om en fil skickas
    if (req.file) {
      if (about.imagePublicId) {
        await cloudinary.uploader.destroy(about.imagePublicId);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "about",
      });
      req.body.imageUrl = result.secure_url;
      req.body.imagePublicId = result.public_id;
    }

    // Uppdatera fälten dynamiskt
    Object.keys(req.body).forEach((key) => {
      // Om det är arrayer (utställningar/stipendier) kan vi ersätta hela listan
      about[key] = req.body[key];
    });

    await about.save();
    res.json(about);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


export default router;