import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Access token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user; // Skicka vidare användaren
    next();
  } catch (err) {
    console.error("Auth middleware", err);
    res.status(403).json({ message: "Access denied." });
  }
};