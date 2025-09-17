import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categoryEnum = ["performance", "skulpturer", "utställningar"];

const mediaSchema = new Schema(
  {
    url: { type: String, required: true },
    photographer: { type: String, required: false },
    public_id:  { type: String, required: true }
  },
  { _id: false }
);

const projectSchema = new Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  material: { type: String, required: true },
  exhibited_at: { type: String, required: true },
  size: {type: String, required: false},
  category: { type: String, enum: categoryEnum, required: true },
  description: { type: String, required: true },
  images: {
    type: [mediaSchema],
    required: true
  },
  video: {
    type: mediaSchema,
    required: false
  },
  order: {type: Number, required: false}
});

const Project = model("Project", projectSchema);

export default Project;