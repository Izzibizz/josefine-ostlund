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

    let updateData = { ...req.body };

    // 🔹 Konvertera JSON-strängar till arrays
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

    // 🔹 Uppdatera/addera exhibitions
    if (updateData.exhibitions) {
      about.exhibitions = updateData.exhibitions.map((item) => {
        const existing = about.exhibitions.id(item._id);
        return existing ? Object.assign(existing, item) : item;
      });
    }

    // 🔹 Uppdatera/addera scholarships
    if (updateData.scholarships) {
      about.scholarships = updateData.scholarships.map((item) => {
        const existing = about.scholarships.id(item._id);
        return existing ? Object.assign(existing, item) : item;
      });
    }

    // 🔹 Uppdatera övriga fält
    Object.keys(updateData).forEach((key) => {
      if (key !== "exhibitions" && key !== "scholarships" && key !== "image") {
        about[key] = updateData[key];
      }
    });

    const updated = await about.save();
    res.json(updated);
  } catch (err) {
    console.error("PATCH /about error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
