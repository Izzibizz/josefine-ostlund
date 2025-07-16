import bcrypt from "bcrypt";
import express from "express";
import { authenticateUser } from "../middlewares/authenticateUser.js";
import { User } from "../models/userSchema.js";

const router = express.Router();

//User Endpoints

router.post("/register", async (req, res) => {
  try {
    const { userName, password } = req.body;
    console.log(userName, password);

    if (!userName) {
      return res.status(400).json({ message: "username is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    //Create a new user
    const user = new User({
      userName: userName,
      password: password, 
    });

    await user.save();
    res.status(201).json({
      message: `Your Registration was successfull ${user.userName}. Please log in now.`,
      id: user._id,
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.error("Register Endpoint", error);
    res.status(400).json({ message: "Could not register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName: userName });

    if (user) {
      const isPasswordCorrect = await user.comparePassword(password);
      if (isPasswordCorrect) {
        res.status(202).json({
          message: `You are logged in ${user.userName}.`,
          id: user._id,
          accessToken: user.accessToken,
        });
      } else {
        res.status(401).json({ message: "This password is incorrect." });
      }
    } else {
      res.status(404).json({
        message:
          "We didn't find an account with that email. Please check your spelling.",
      });
    }
  } catch (error) {
    console.error("Login Endpoint", error);
    res.status(500).json({
      message: "Somethings wrong with the sign in. Please try again later.",
    });
  }
});

// Route to get all users
router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).exec(); // Fetch all users

    if (users.length > 0) {
      res.status(200).json({
        users: users,
        message: "Success in retrieving all users.",
      });
    } else {
      res.status(404).json({
        message: "No users found.",
      });
    }
  } catch (error) {
    console.error("Get all users endpoint:", error);
    res.status(500).json({
      message:
        "Sorry, we couldn't retrieve users at this time. Please try again later.",
    });
  }
});

router.get("/profile/:userId", authenticateUser);
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId }).exec();

    if (user) {
      res.status(200).json({
        user: user,
        message: "Success in finding the user profile.",
      });
    } else {
      res.status(404).json({
        message: "Sorry, there is no user with that ID.",
      });
    }
  } catch (error) {
    console.error("Get user endpoint:", error);
    res.status(500).json({
      message:
        "Sorry, this page is not available at the moment. Please try again later.",
    });
  }
});

router.delete("/profile/:userId", authenticateUser);
router.delete("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.status(200).json({ message: "User was successfully deleted." });
    } else {
      res.status(404).json({ message: "There is no user with that ID." });
    }
  } catch (error) {
    console.error("Profile Endpoint Delete", error);
    res.status(500).json({
      message: "Failed to delete user.",
    });
  }
});

export default router;
