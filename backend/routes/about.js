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
    if (!about) return res.status(404).json({ message: "About not found" });

    // Hantera arrayer
    if (req.body.exhibitions) {
      req.body.exhibitions = JSON.parse(req.body.exhibitions);
    }
    if (req.body.scholarships) {
      req.body.scholarships = JSON.parse(req.body.scholarships);
    }

    // Hantera bild
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "about",
      });
      req.body.image = upload.secure_url;
    }

    // Merge fälten in i dokumentet
    Object.assign(about, req.body);

    const updated = await about.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
