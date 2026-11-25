const multer = require('multer');
const ApiError = require('../utils/ApiError');

// In-memory storage (prevents storing temporary files on local production disk)
const storage = multer.memoryStorage();

// File filter: Only allow JPEG, PNG, WEBP images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid image format "${file.mimetype}". Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max per image
  }
});

module.exports = upload;
