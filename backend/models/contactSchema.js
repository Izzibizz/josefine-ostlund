import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  telefon: {
    type: String,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  instagram: {
    type: String,
  },
  cv: {
    type: String,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;