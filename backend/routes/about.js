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

router.post("/", upload.single("image"), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // 🔹 Konvertera JSON-strängar till arrayer
    if (updateData.exhibitions && typeof updateData.exhibitions === "string") {
      updateData.exhibitions = JSON.parse(updateData.exhibitions);
    }
    if (updateData.scholarships && typeof updateData.scholarships === "string") {
      updateData.scholarships = JSON.parse(updateData.scholarships);
    }

    // 🔹 Hantera bild via Cloudinary
    if (req.file) {
      const buffer = req.file.buffer;
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "portratt" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });
      updateData.image = uploadResult.secure_url;
    }

    // 🔹 Kolla om About redan finns
    let about = await About.findOne();

    if (about) {
      // uppdatera allt
      about = await About.findByIdAndUpdate(about._id, updateData, { new: true });
    } else {
      // skapa nytt
      about = new About(updateData);
      await about.save();
    }

    res.json(about);
  } catch (err) {
    console.error("POST /about error:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
