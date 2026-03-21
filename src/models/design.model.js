const mongoose = require("mongoose");

const designSchema = new mongoose.Schema(
  {
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", index: true },
    service: { type: String, trim: true, default: "" },
    serviceName: { type: String, trim: true, default: "" },
    serviceType: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, default: "active", index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    strict: false,
    collection: "designs",
  }
);

module.exports = mongoose.model("Design", designSchema);
