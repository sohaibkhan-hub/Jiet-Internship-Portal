import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Company Basic Information
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Company Location
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
    },

    // Contact Information
    contactPerson: {
      name: String,
      email: String,
      phoneNumber: String,
    },

    // Website
    website: {
      type: String,
      trim: true,
    },

    // OPTIMIZATION: Domain Tagging for instant filtering
    // Allows searching: "Find all companies hiring for Domain X"
    domainTags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
      },
    ],

    // Allowed Branches: Array of Branch references
    // E.g., Only CSE and ECE students can apply
    allowedBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    // Minimum CGPA Required
    minCgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Maximum Allowed Backlogs
    maxBacklogs: {
      type: Number,
      default: 0,
    },

    // SEAT MANAGEMENT (Critical for Allocation Logic)
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    // Filled Seats: Atomically incremented during allocation
    filledSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Internship Duration (in months)
    durationMonths: {
      type: Number,
      default: 2,
    },

    // Stipend/CTC Information
    stipendType: {
      type: String,
      enum: ["Monthly", "Lumpsum", "None"],
      default: "Monthly",
    },
    stipendAmount: {
      type: Number,
      default: 0,
    },

    // Job Description/Requirements
    jobDescription: {
      type: String,
      trim: true,
    },

    // Company is Active for Recruitment
    isActive: {
      type: Boolean,
      default: true,
    },

    // Recruitment Status
    recruitmentStatus: {
      type: String,
      enum: ["OPEN", "CLOSED", "PAUSED"],
      default: "OPEN",
    },
  },
  { timestamps: true, strict: "throw" },
);

// Indexes for faster lookups and filtering
companySchema.index({ isActive: 1 });
companySchema.index({ recruitmentStatus: 1 });
companySchema.index({ domainTags: 1 });
companySchema.index({ allowedBranches: 1 });
companySchema.index({ minCgpa: 1 });

// Index for seat availability check (for allocation queries)
companySchema.index({ filledSeats: 1, totalSeats: 1 });

export const Company = mongoose.model("Company", companySchema);
