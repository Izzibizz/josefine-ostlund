import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: [
      {
        validator: (value) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(value),
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, and a number",
      },
    ],
  },
  accessToken: {
    type: String, // Generera manuellt via JWT eller uuid
  },
});

// 🔐 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔍 Add password comparison method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model("User", userSchema);
