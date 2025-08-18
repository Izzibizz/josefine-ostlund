import express from "express";
import About from "../models/aboutSchema.js";

const router = express.Router();

// Hämta det enda About-dokumentet
router.get("/", async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Uppdatera About (utan id)
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

// Lägg till en utställning
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

// Ta bort en utställning
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

// Lägg till ett stipendium
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

// Ta bort ett stipendium
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

export default router;

