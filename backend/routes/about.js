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

router.patch("/", async (req, res) => {
  try {
    const updated = await About.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "About ej hittad" });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/utstallningar", async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.utställningar.push(req.body);
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/utstallningar/:exhibitionId", async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.utställningar = about.utställningar.filter(
      (ex) => ex._id.toString() !== exhibitionId
    );
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/stipendier", async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.stipendier.push(req.body);
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/stipendier/:scholarshipId", async (req, res) => {
  try {
    const { scholarshipId } = req.params;
    const about = await About.findOne();
    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.stipendier = about.stipendier.filter(
      (st) => st._id.toString() !== scholarshipId
    );
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/image", upload.single("image"), async (req, res) => {
  try {
    const about = await About.findOne(); // hämtar ditt enda about-dokument
    if (!about) return res.status(404).json({ message: "About not found" });

    // Radera tidigare bild från Cloudinary om det finns
    if (about.imagePublicId) {
      await cloudinary.uploader.destroy(about.imagePublicId);
    }

    // Ladda upp ny bild till Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "about",
    });

    // Spara ny bild-url och publicId i dokumentet
    about.imageUrl = result.secure_url;
    about.imagePublicId = result.public_id;
    await about.save();

    res.json({ message: "Image updated", imageUrl: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;