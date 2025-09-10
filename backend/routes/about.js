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

// POST → skapa eller uppdatera hela About
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const existing = await About.findOne();
    let updateData = { ...req.body };

    // Hantera bild
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
      updateData.image = (uploadResult).secure_url;
    }

    if (existing) {
      const updated = await About.findByIdAndUpdate(existing._id, updateData, { new: true });
      return res.json(updated);
    } else {
      const created = new About(updateData);
      await created.save();
      return res.status(201).json(created);
    }
  } catch (error) {
    console.error("POST /about error:", error);
    res.status(500).json({ message: "Failed to save About content." });
  }
});

/* // DELETE → ta bort ett objekt från exhibitions eller scholarships
router.delete("/", async (req, res) => {
  try {
    const { type, id } = req.body;

    if (!["exhibitions", "scholarships"].includes(type) || !id) {
      return res.status(400).json({ message: "Invalid delete request." });
    }

    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About not found." });

    about[type] = about[type].filter((item) => item._id.toString() !== id);
    await about.save();

    res.json(about);
  } catch (error) {
    console.error("DELETE /about error:", error);
    res.status(500).json({ message: "Failed to delete item from About." });
  }
}); */



export default router;
