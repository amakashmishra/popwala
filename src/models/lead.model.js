const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    projectType: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    stage: {
      type: String,
      enum: ["new", "contacted", "site_visit", "quotation_sent", "completed", "cancelled"],
      default: "new",
      index: true,
    },
    deletedAt: { type: Date, default: null, index: true },
    budget: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
