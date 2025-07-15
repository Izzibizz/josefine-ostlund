// seedDatabase.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "./models/projectSchema.js";
import projectData from "./data/projects.json";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/josefine";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const seedDatabase = async () => {
  try {
    await Project.deleteMany();
    await Project.insertMany(projectData);
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
