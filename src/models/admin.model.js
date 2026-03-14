const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const roles = require("../constants/roles");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: [roles.ADMIN], default: roles.ADMIN, index: true },
    status: { type: String, enum: ["active", "blocked", "inactive"], default: "active", index: true },
    resetPasswordTokenHash: { type: String, default: null, select: false },
    resetPasswordExpiresAt: { type: Date, default: null, select: false },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function preSave() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function comparePassword(rawPassword) {
  return bcrypt.compare(rawPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
