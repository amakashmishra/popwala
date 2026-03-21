const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitleTag: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    buttonText: { type: String, trim: true, default: "" },
    redirectUrl: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    imagePublicId: { type: String, trim: true, default: "" },
    themeColor: { type: String, trim: true, default: "#1f7a61" },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", promotionSchema);
