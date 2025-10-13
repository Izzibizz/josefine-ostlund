import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categoryEnum = ["performance", "skulpturer", "utställningar"];

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    photographer: { type: String, required: false },
    public_id:  { type: String, required: true }
  }
);

const projectSchema = new Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  material: { type: String, required: false },
  exhibited_at: { type: String, required: false },
  size: {type: String, required: false},
  category: { type: String, enum: categoryEnum, required: true },
  description: { type: String, required: false },
  short_description: { type: String, required: false},
  images: {
    type: [mediaSchema],
    required: true
  },
  video: {
    type: mediaSchema,
    required: false
  },
  order: {type: Number, required: true}
});

const Project = model("Project", projectSchema);

export default Project;