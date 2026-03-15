const mongoose = require("mongoose");

const styleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    imagePublicId: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Style", styleSchema);
