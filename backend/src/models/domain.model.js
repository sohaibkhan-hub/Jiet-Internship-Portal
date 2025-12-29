import mongoose from "mongoose";

const domainSchema = new mongoose.Schema(
  {
    // Domain Name: e.g., "IT Services & Consulting", "Digital Marketing"
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Branches eligible for this domain (ObjectId references)
    applicableBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
      },
    ],

    // Short description of the domain
    description: {
      type: String,
      trim: true,
    },

    // Is this domain active for hiring?
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, strict: "throw" },
);

// Index for faster name lookups
domainSchema.index({ isActive: 1 });

export const Domain = mongoose.model("Domain", domainSchema);
