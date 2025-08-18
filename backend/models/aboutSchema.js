import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ExhibitonSchema = new mongoose.Schema({
  plats: { type: String, required: true },
  stad: { type: String, default: null },
  year: { type: Number, default: null },
  type: { type: String, default: null },
  med: { type: String, default: null }
});

const ScholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true }
});

const aboutSchema = new Schema(
{
  bio_1: { type: String, required: true },
  bio_2: { type: String, required: true },
  utställningar: [ExhibitonSchema],
  stipendier: [ScholarshipSchema]
}
)


const About = model("About", aboutSchema);

export default About;