const { uploadToCloudinary } = require('../services/cloudinaryService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Admin: Upload image(s) to Cloudinary
 * POST /api/v1/admin/upload
 */
const uploadImages = asyncHandler(async (req, res) => {
  const folder = req.body.folder || 'products';

  if (!req.file && (!req.files || req.files.length === 0)) {
    throw new ApiError(400, 'Please select at least one image to upload');
  }

  // Handle single file
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, folder);
    return res.status(200).json(
      new ApiResponse(200, uploaded, 'Image uploaded successfully to Cloudinary')
    );
  }

  // Handle multiple files
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, folder));
    const results = await Promise.all(uploadPromises);
    return res.status(200).json(
      new ApiResponse(200, results, `${results.length} images uploaded successfully to Cloudinary`)
    );
  }
});

module.exports = {
  uploadImages
};
