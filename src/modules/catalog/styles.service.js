const AppError = require("../../utils/appError");
const fileService = require("../../services/file.service");
const styleRepository = require("../../repositories/style.repository");

const sanitizeStyle = (style) => ({
  id: style._id,
  name: style.name,
  description: style.description,
  imageUrl: style.imageUrl || "",
  status: style.status,
  createdAt: style.createdAt,
  updatedAt: style.updatedAt,
});

const toLocalizedText = (text) => (typeof text === "string" ? text.trim() : "");

const listStyles = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [styles, total] = await Promise.all([
    styleRepository.findAll({ search, status, skip, limit: safeLimit }),
    styleRepository.countAll({ search, status }),
  ]);

  return {
    items: styles.map(sanitizeStyle),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createStyle = async ({ payload, file }) => {
  const data = {
    name: payload.name.trim(),
    description: toLocalizedText(payload.description),
    status: payload.status || "active",
  };

  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "catalog/styles");
    data.imageUrl = uploaded.secure_url;
    data.imagePublicId = uploaded.public_id;
  }

  const style = await styleRepository.create(data);
  return sanitizeStyle(style);
};

const getStyleById = async (id) => {
  const style = await styleRepository.findById(id);
  if (!style) {
    throw new AppError("Style not found", 404, "STYLE_NOT_FOUND");
  }
  return sanitizeStyle(style);
};

const updateStyle = async ({ id, payload, file }) => {
  const existing = await styleRepository.findById(id);
  if (!existing) {
    throw new AppError("Style not found", 404, "STYLE_NOT_FOUND");
  }

  const patch = {};
  if (payload.name) {
    patch.name = payload.name.trim();
  }
  if (payload.description !== undefined) {
    patch.description = toLocalizedText(payload.description);
  }
  if (payload.status) {
    patch.status = payload.status;
  }

  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "catalog/styles");
    patch.imageUrl = uploaded.secure_url;
    patch.imagePublicId = uploaded.public_id;
    if (existing.imagePublicId) {
      await fileService.deleteImage(existing.imagePublicId);
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError("No fields provided to update", 400, "VALIDATION_ERROR");
  }

  const updated = await styleRepository.updateById(id, patch);
  return sanitizeStyle(updated);
};

const updateStyleStatus = async ({ id, status }) => {
  const updated = await styleRepository.updateById(id, { status });
  if (!updated) {
    throw new AppError("Style not found", 404, "STYLE_NOT_FOUND");
  }
  return sanitizeStyle(updated);
};

const deleteStyle = async (id) => {
  const style = await styleRepository.softDeleteById(id);
  if (!style) {
    throw new AppError("Style not found", 404, "STYLE_NOT_FOUND");
  }
  if (style.imagePublicId) {
    await fileService.deleteImage(style.imagePublicId);
  }
};

const listActiveStyles = async () => {
  const styles = await styleRepository.findActive({ sort: { name: 1 }, limit: 100 });
  return styles.map((style) => ({
    id: style._id,
    name: style.name,
    description: style.description,
    imageUrl: style.imageUrl || "",
  }));
};

module.exports = {
  listStyles,
  createStyle,
  getStyleById,
  updateStyle,
  updateStyleStatus,
  deleteStyle,
  listActiveStyles,
};
