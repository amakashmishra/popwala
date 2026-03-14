const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const contractorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    phoneNumber: { type: String, required: true, trim: true, unique: true, index: true },
    password: { type: String, required: true, select: false },
    companyName: { type: String, required: true, trim: true, maxlength: 160 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

contractorSchema.pre("save", async function preSave() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

contractorSchema.methods.comparePassword = function comparePassword(rawPassword) {
  if (!this.password) return false;
  return bcrypt.compare(rawPassword, this.password);
};

module.exports = mongoose.model("Contractor", contractorSchema);
