import express from "express";
import Contact from "../models/contactSchema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true } 
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Kontakt ej hittad" });
    }

    res.json(updatedContact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;