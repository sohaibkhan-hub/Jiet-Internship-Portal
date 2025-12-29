import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    // Authentication Email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },

    // Password (Optional for OAuth providers)
    password: {
      type: String,
      select: false,
    },

    // Temporary Password for resets
    tempPassword: {
      type: String,
      select: false,
    },

    // ROLES: Determines what dashboard they see
    role: {
      type: String,
      enum: ["STUDENT", "TPO", "FACULTY", "ADMIN"],
      required: true,
      default: "STUDENT",
    },

    // Dynamic Linking: Connects to the specific profile collection
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "roleModel", // Dynamic reference based on role
    },

    // OAuth Provider Info
    providerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    // Profile Information
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    profileImage: {
      url: { type: String },
      filename: { type: String },
    },

    // Token Management
    accessToken: {
      type: String,
      select: false,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Additional Fields
    lastLogin: Date,
  },
  { timestamps: true, strict: "throw" },
);

// Indexes for common queries
userSchema.index({ role: 1 });
userSchema.index({ profileId: 1 });

// Hash password before saving
userSchema.pre("save", async function () {
  if (this.provider !== "LOCAL" || !this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "7d" },
  );
};

export const User = mongoose.model("User", userSchema);
