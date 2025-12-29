import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    // Link back to User Authentication Model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    // Employee ID (unique identifier for faculty)
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Faculty fullName
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: String, // Store as YYYY-MM-DD
      trim: true,
    },

    // Job Designation: e.g., "TPO", "Assistant Professor", "HOD"
    designation: {
      type: String,
      enum: [
        "TPO",
        "Assistant Professor",
        "Associate Professor",
        "Professor",
        "HOD",
      ],
      required: true,
    },

    // Department/Branch Association
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    // Contact Information
    phoneNumber: {
      type: String,
      sparse: true,
      validate: {
        validator: (v) => !v || /^[6-9]\d{9}$/.test(v),
        message: "Invalid Indian phone number",
      },
    },

    // Is this faculty member active?
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strict: "throw" },
);

// Indexes for faster lookups
facultySchema.index({ user: 1 });
facultySchema.index({ designation: 1 });
facultySchema.index({ isTpoHead: 1 });
facultySchema.index({ isActive: 1 });

export const Faculty = mongoose.model("Faculty", facultySchema);
