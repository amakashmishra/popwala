const AppError = require("../../utils/appError");
const bannerRepository = require("../../repositories/banner.repository");
const fileService = require("../../services/file.service");

const toLocalized = (value = "") => {
  if (value && typeof value === "object") {
    return {
      en: value.en || "",
      hi: value.hi || value.en || "",
      mr: value.mr || value.en || "",
    };
  }
  const text = typeof value === "string" ? value : "";
  return { en: text, hi: text, mr: text };
};

const sanitizeBanner = (banner) => {
  if (!banner) return null;
  return {
    id: banner._id,
    imageUrl: banner.imageUrl,
    title: toLocalized(banner.title),
    description: toLocalized(banner.description),
    status: banner.status,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  };
};

const listBanners = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [banners, total] = await Promise.all([
    bannerRepository.findAll({ search, status, skip, limit: safeLimit }),
    bannerRepository.countAll({ search, status }),
  ]);

  return {
    banners: banners.map(sanitizeBanner),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createBanner = async ({ payload, file }) => {
  if (!file) {
    throw new AppError("Banner image is required", 400, "VALIDATION_ERROR");
  }

  const uploaded = await fileService.uploadImageBuffer(file.buffer, "website_banners");
  const banner = await bannerRepository.create({
    imageUrl: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
    title: {
      en: payload.titleEn,
      hi: payload.titleHi,
      mr: payload.titleMr,
    },
    description: {
      en: payload.descriptionEn,
      hi: payload.descriptionHi,
      mr: payload.descriptionMr,
    },
    status: payload.status || "active",
  });

  return sanitizeBanner(banner);
};

const getBannerById = async (id) => {
  const banner = await bannerRepository.findById(id);
  if (!banner) throw new AppError("Banner not found", 404, "BANNER_NOT_FOUND");
  return sanitizeBanner(banner);
};

const updateBanner = async ({ id, payload, file }) => {
  const existing = await bannerRepository.findById(id);
  if (!existing) throw new AppError("Banner not found", 404, "BANNER_NOT_FOUND");
  const existingTitle = toLocalized(existing.title);
  const existingDescription = toLocalized(existing.description);

  const patch = {
    ...(payload.status ? { status: payload.status } : {}),
  };

  const titlePatch = {
    ...(payload.titleEn ? { en: payload.titleEn } : {}),
    ...(payload.titleHi ? { hi: payload.titleHi } : {}),
    ...(payload.titleMr ? { mr: payload.titleMr } : {}),
  };
  if (Object.keys(titlePatch).length > 0) {
    patch.title = {
      en: titlePatch.en || existingTitle.en,
      hi: titlePatch.hi || existingTitle.hi,
      mr: titlePatch.mr || existingTitle.mr,
    };
  }

  const descriptionPatch = {
    ...(payload.descriptionEn ? { en: payload.descriptionEn } : {}),
    ...(payload.descriptionHi ? { hi: payload.descriptionHi } : {}),
    ...(payload.descriptionMr ? { mr: payload.descriptionMr } : {}),
  };
  if (Object.keys(descriptionPatch).length > 0) {
    patch.description = {
      en: descriptionPatch.en || existingDescription.en,
      hi: descriptionPatch.hi || existingDescription.hi,
      mr: descriptionPatch.mr || existingDescription.mr,
    };
  }

  if (file) {
    const uploaded = await fileService.uploadImageBuffer(file.buffer, "website_banners");
    patch.imageUrl = uploaded.secure_url;
    patch.imagePublicId = uploaded.public_id;
    await fileService.deleteImage(existing.imagePublicId);
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError("No fields provided to update", 400, "VALIDATION_ERROR");
  }

  const updated = await bannerRepository.updateById(id, patch);
  return sanitizeBanner(updated);
};

const updateBannerStatus = async ({ id, status }) => {
  const updated = await bannerRepository.updateById(id, { status });
  if (!updated) throw new AppError("Banner not found", 404, "BANNER_NOT_FOUND");
  return sanitizeBanner(updated);
};

const deleteBanner = async (id) => {
  const banner = await bannerRepository.softDeleteById(id);
  if (!banner) throw new AppError("Banner not found", 404, "BANNER_NOT_FOUND");
  await fileService.deleteImage(banner.imagePublicId);
};

module.exports = {
  listBanners,
  createBanner,
  getBannerById,
  updateBanner,
  updateBannerStatus,
  deleteBanner,
};
