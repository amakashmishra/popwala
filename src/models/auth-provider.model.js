const mongoose = require("mongoose");

const authProviderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["google"], required: true },
    providerId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    providerData: { type: Object, default: {} },
  },
  { timestamps: true }
);

authProviderSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model("AuthProvider", authProviderSchema);
