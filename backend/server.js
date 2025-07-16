import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import documentationRoutes from "./routes/documentation.js";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: [
    "https://josefine-ostlund.netlify.app",
    "https://josefineostlund.se",
    "https://josefineostlund.com",
    "http://localhost:5173"
  ],}));
app.use(express.json());

// Routes
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/", documentationRoutes);

// Start servern
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
