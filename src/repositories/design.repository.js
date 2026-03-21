const mongoose = require("mongoose");
const Design = require("../models/design.model");

const countForService = async ({ serviceId, serviceName }) => {
  const normalizedName = (serviceName || "").trim();
  const serviceConditions = [];

  if (mongoose.isValidObjectId(serviceId)) {
    serviceConditions.push({ serviceId: new mongoose.Types.ObjectId(serviceId) });
    serviceConditions.push({ service: String(serviceId) });
  }

  if (normalizedName) {
    serviceConditions.push({ service: normalizedName });
    serviceConditions.push({ serviceName: normalizedName });
    serviceConditions.push({ serviceType: normalizedName });
  }

  if (serviceConditions.length === 0) {
    return 0;
  }

  return Design.countDocuments({
    deletedAt: null,
    $and: [{ $or: [{ status: { $exists: false } }, { status: "active" }] }, { $or: serviceConditions }],
  });
};

module.exports = {
  countForService,
};
