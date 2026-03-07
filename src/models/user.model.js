const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const roles = require("../constants/roles");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, select: false },
    googleId: { type: String, index: true, default: null },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: Object.values(roles), default: roles.USER, index: true },
    status: { type: String, enum: ["active", "blocked", "inactive"], default: "active" },
    isEmailVerified: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave() {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(rawPassword) {
  if (!this.password) return false;
  return bcrypt.compare(rawPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
