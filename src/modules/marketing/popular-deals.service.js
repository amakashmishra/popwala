const AppError = require("../../utils/appError");
const fileService = require("../../services/file.service");
const popularDealRepository = require("../../repositories/popular-deal.repository");

const sanitize = (item) => ({
  id: item._id,
  name: item.title,
  description: item.description,
  cardTitle: item.cardTitle,
  title: item.title,
  subtitleTag: item.subtitleTag,
  buttonText: item.buttonText,
  redirectUrl: item.redirectUrl,
  imageUrl: item.imageUrl || "",
  themeColor: item.themeColor || "#1f7ea7",
  status: item.status,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const list = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;
  const [items, total] = await Promise.all([
    popularDealRepository.findAll({ search, status, skip, limit: safeLimit }),
    popularDealRepository.countAll({ search, status }),
  ]);
  return {
    items: items.map(sanitize),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const create = async ({ payload, file }) => {
  const data = {
    cardTitle: payload.cardTitle?.trim() || "",
    title: payload.title?.trim(),
    subtitleTag: payload.subtitleTag?.trim() || "",
    description: payload.description?.trim() || "",
    buttonText: payload.buttonText?.trim() || "",
    redirectUrl: payload.redirectUrl?.trim() || "",
    themeColor: payload.themeColor?.trim() || "#1f7ea7",
    status: payload.status || "active",
  };
  if (!data.title) {
    throw new AppError("Title is required", 400, "VALIDATION_ERROR");
  }
  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "homepage/deals");
    data.imageUrl = uploaded.secure_url;
    data.imagePublicId = uploaded.public_id;
  }
  const item = await popularDealRepository.create(data);
  return sanitize(item);
};

const getById = async (id) => {
  const item = await popularDealRepository.findById(id);
  if (!item) throw new AppError("Popular deal not found", 404, "POPULAR_DEAL_NOT_FOUND");
  return sanitize(item);
};

const update = async ({ id, payload, file }) => {
  const existing = await popularDealRepository.findById(id);
  if (!existing) throw new AppError("Popular deal not found", 404, "POPULAR_DEAL_NOT_FOUND");
  const patch = {};
  ["cardTitle", "title", "subtitleTag", "description", "buttonText", "redirectUrl", "themeColor", "status"].forEach((key) => {
    if (payload[key] !== undefined) patch[key] = String(payload[key]).trim();
  });
  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "homepage/deals");
    patch.imageUrl = uploaded.secure_url;
    patch.imagePublicId = uploaded.public_id;
    if (existing.imagePublicId) await fileService.deleteImage(existing.imagePublicId);
  }
  if (Object.keys(patch).length === 0) {
    throw new AppError("No fields provided to update", 400, "VALIDATION_ERROR");
  }
  const updated = await popularDealRepository.updateById(id, patch);
  return sanitize(updated);
};

const updateStatus = async ({ id, status }) => {
  const updated = await popularDealRepository.updateById(id, { status });
  if (!updated) throw new AppError("Popular deal not found", 404, "POPULAR_DEAL_NOT_FOUND");
  return sanitize(updated);
};

const remove = async (id) => {
  const item = await popularDealRepository.softDeleteById(id);
  if (!item) throw new AppError("Popular deal not found", 404, "POPULAR_DEAL_NOT_FOUND");
  if (item.imagePublicId) await fileService.deleteImage(item.imagePublicId);
};

const listActive = async () => {
  const items = await popularDealRepository.findActive({ sort: { createdAt: -1 }, limit: 100 });
  return items.map(sanitize);
};

module.exports = {
  list,
  create,
  getById,
  update,
  updateStatus,
  remove,
  listActive,
};
