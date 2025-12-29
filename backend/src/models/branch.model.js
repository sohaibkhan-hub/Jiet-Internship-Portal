import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    college: {
      type: String,
      enum: ["JIET", "JDAT"],
      required: true,
    },
    // Branch Name: e.g., "Computer Science & Engineering"
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // External Mappings for integration with student data
    externalMappings: [
      {
        branchId: String,    // external branchId (e.g., 18)
        collegeId: String,   // external collegeId (e.g., 1)
        year: Number,        // e.g., 2, 3, 4
      },
    ],

    // Branch Code: e.g., "CSE" (uppercase)
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Categorization: B.Tech, M.Tech, MBA, BCA, MCA
    programType: {
      type: String,
      enum: ["B.Tech", "Management", "Computer Application", "Design"],
      required: true,
    },

    // Head of Department (HOD)
    hodName: {
      type: String,
      trim: true,
    },

    // Department Head Contact
    hodEmail: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },

    // Is this branch active for admissions/placements?
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strict: "throw" },
);

// Indexes for faster lookups
branchSchema.index({ code: 1, programType: 1 });
branchSchema.index({ isActive: 1 });

export const Branch = mongoose.model("Branch", branchSchema);
