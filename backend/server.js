import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import projectRoutes from "./routes/projects.js";
import userRoutes from "./routes/user.js";
import aboutRoutes from "./routes/about.js"
import contactRoutes from "./routes/contact.js"

dotenv.config();

const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://josefine-ostlund.netlify.app", 
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());


// Routes
app.use("/projects", projectRoutes);
app.use("/users", userRoutes);
app.use("/about", aboutRoutes);
app.use("/contact", contactRoutes);


// Start servern
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
