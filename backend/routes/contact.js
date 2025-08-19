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

router.patch("/", async (req, res) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      {},                 
      { $set: req.body }, 
      { new: true }     
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Ingen kontakt hittad" });
    }

    res.json(updatedContact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;