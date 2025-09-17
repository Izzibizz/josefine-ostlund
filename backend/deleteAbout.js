
import mongoose from "mongoose";
import dotenv from "dotenv";

import About from "./models/aboutSchema.js";

import { readFileSync } from "fs";

const aboutData = JSON.parse(readFileSync(new URL("./data/about.json", import.meta.url)));

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/josefine";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const seedAbout = async () => {
  try {
    await About.deleteMany();

    await About.insertMany(aboutData);

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.disconnect();
  }
};

seedAbout();
