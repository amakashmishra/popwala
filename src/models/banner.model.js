const mongoose = require("mongoose");

const localizedTextSchema = new mongoose.Schema(
  {
    en: { type: String, required: true, trim: true, maxlength: 500 },
    hi: { type: String, required: true, trim: true, maxlength: 500 },
    mr: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    imagePublicId: { type: String, required: true, trim: true },
    title: { type: localizedTextSchema, required: true },
    description: { type: localizedTextSchema, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
