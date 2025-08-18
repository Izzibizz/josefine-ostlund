import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ExhibitonSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  place: { type: String, required: true },
  city: { type: String, default: null },
  year: { type: Number, default: null },
  type: { type: String, default: null },
  med: { type: String, default: null }
});

const ScholarshipSchema = new mongoose.Schema({
   _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true },
  year: { type: Number, required: true }
});

const aboutSchema = new Schema(
{
  bio_1: { type: String, required: true },
  bio_2: { type: String, required: true },
  exhibitions: [ExhibitonSchema],
  scholarships: [ScholarshipSchema],
  image: String
}
)


const About = model("About", aboutSchema);

export default About;