const bannerRepository = require("../../repositories/banner.repository");

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

const sanitizeBanner = (banner) => ({
  id: banner._id,
  imageUrl: banner.imageUrl,
  title: toLocalized(banner.title),
  description: toLocalized(banner.description),
  status: banner.status,
  createdAt: banner.createdAt,
  updatedAt: banner.updatedAt,
});

const listActiveBanners = async () => {
  const banners = await bannerRepository.findActive({ limit: 20 });
  return banners.map(sanitizeBanner);
};

module.exports = {
  listActiveBanners,
};
