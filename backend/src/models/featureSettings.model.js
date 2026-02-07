import mongoose from "mongoose";

const featureSettingsSchema = new mongoose.Schema(
  {
    enableUpdateDomain: {
      type: Boolean,
      default: true,
    },
    enableApplyCompany: {
      type: Boolean,
      default: true,
    },
    enableCompanyList: {
      type: Boolean,
      default: true,
    },
    enableMyApplication: {
      type: Boolean,
      default: true,
    },
    enableMyApplication: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const FeatureSettings = mongoose.model("FeatureSettings", featureSettingsSchema);
