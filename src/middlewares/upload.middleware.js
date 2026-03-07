const multer = require("multer");
const AppError = require("../utils/appError");

const storage = multer.memoryStorage();
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError("Only JPG, PNG, and WEBP files are allowed", 400, "INVALID_FILE_TYPE"));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
