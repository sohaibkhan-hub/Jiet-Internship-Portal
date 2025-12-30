import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    // 1. AUTH LINK: Reference to User model for authentication
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // 2. IDENTITY INFORMATION
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    fatherName: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: String, // Store as YYYY-MM-DD
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    category: {
      type: String,
      enum: ["General", "OBC", "SC", "ST", "EWS"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      validate: {
        validator: (v) => !v || /^[6-9]\d{9}$/.test(v),
        message: "Invalid Indian phone number",
      },
    },

    // 4. ACADEMIC DETAILS (Linked to Branch)
    // Instead of storing 'CSE', 'B.Tech' directly, we link to Branch ID
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
    },

    year: {
      type: String, // e.g., "2024-2028"
      trim: true,
    },

    currentCgpa: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 10,
    },

    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 7. INTERNSHIP FORM (Core Feature)
    internshipData: {
      // SURVEY DATA
      isParticipating: {
        type: Boolean,
        default: false,
      },
      alternativeCareerPath: {
        type: String,
        trim: true,
      },
      expectedSalary: {
        type: String,
        trim: true,
      },

      // Preferred Domains (Linked by ID for optimization)
      preferredDomains: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Domain",
        },
      ],

      // APPLICATION DATA
      isFormSubmitted: {
        type: Boolean,
        default: false,
      },

      // 4 Priority Choices
      choices: [
        {
          priority: {
            type: Number,
            min: 1,
            max: 4,
          },
          company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
          },
          location: {
            type: String,
          },
          domain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Domain",
          },
        },
      ],

      // Current Status
      approvalStatus: {
        type: String,
        enum: [
          "NOT_APPLIED",
          "SUBMITTED",
          "PENDING_REVIEW",
          "APPROVED_BY_TPO",
          "ALLOCATED",
          "REJECTED_BY_TPO",
          "REJECTED",
          "NOT_ALLOCATED"
        ],
        default: "NOT_APPLIED",
      },

      // Current Status
      allocationStatus: {
        type: String,
        enum: ["NOT_APPLIED", "ALLOCATED", "REJECTED", "NOT_ALLOCATED"],
        default: "NOT_APPLIED",
      },

      // Status History
      approvalStatusHistory: [
        {
          status: {
            type: String,
            enum: ["NOT_APPLIED", "SUBMITTED", "PENDING_REVIEW", "APPROVED_BY_TPO", "ALLOCATED", "REJECTED_BY_TPO", "REJECTED", "NOT_ALLOCATED"],
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      rejectionReason: {
        type: String,
        trim: true,
      },

      // The Final Result
      allocatedCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        default: null,
      },
    },

    // 8. ACCOUNT STATUS
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strict: "throw" },
);

// INDEXES for fast searching and filtering (Critical for TPO Dashboard)
studentSchema.index({ "internshipData.allocationStatus": 1 });
studentSchema.index({ branch: 1 });
studentSchema.index({ "internshipData.isFormSubmitted": 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ "internshipData.preferredDomains": 1 });

// Compound index for TPO dashboard queries
studentSchema.index({ branch: 1, "internshipData.allocationStatus": 1 });

export const Student = mongoose.model("Student", studentSchema);
