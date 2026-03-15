const cloudinary = require("../config/cloudinary");
const env = require("../config/env");
const AppError = require("../utils/appError");

const uploadImageBuffer = (buffer, folder = "uploads") => {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      "Cloudinary is not configured for this environment. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      500,
      "CLOUDINARY_NOT_CONFIGURED"
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) {
          if (error?.message?.toLowerCase().includes("cloud_name is disabled")) {
            return reject(
              new AppError(
                "Cloudinary cloud is disabled. Please enable your Cloudinary account or use valid active Cloud credentials.",
                500,
                "CLOUDINARY_DISABLED"
              )
            );
          }
          return reject(error);
        }
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

module.exports = {
  uploadImageBuffer,
  deleteImage,
};
