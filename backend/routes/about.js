
import express from "express";
import About from "../models/aboutSchema.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await About.findByIdAndUpdate(
      id,
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

router.post("/:id/utstallningar", async (req, res) => {
  try {
    const { id } = req.params;
    const about = await About.findById(id);

    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.utställningar.push(req.body);
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete("/:id/utstallningar/:exhibitionId", async (req, res) => {
  try {
    const { id, exhibitionId } = req.params;

    const about = await About.findById(id);
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

router.post("/:id/stipendier", async (req, res) => {
  try {
    const { id } = req.params;
    const about = await About.findById(id);

    if (!about) return res.status(404).json({ message: "About ej hittad" });

    about.stipendier.push(req.body);
    await about.save();

    res.json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id/stipendier/:scholarshipId", async (req, res) => {
  try {
    const { id, scholarshipId } = req.params;

    const about = await About.findById(id);
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
