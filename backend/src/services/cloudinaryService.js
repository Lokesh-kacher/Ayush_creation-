const cloudinary = require('../config/cloudinary');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Upload a memory buffer stream directly to Cloudinary
 * @param {Buffer} fileBuffer
 * @param {string} folder - subfolder name e.g. 'products', 'gallery'
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are not configured
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      return reject(
        new ApiError(
          500,
          'Cloudinary is not configured on the backend. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env'
        )
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ayush-creation/${folder}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(500, `Cloudinary upload failed: ${error.message}`));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary by its public ID
 * @param {string} publicId
 */
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return null;
  if (!env.CLOUDINARY_CLOUD_NAME) return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.warn(`Could not delete Cloudinary asset with publicId: ${publicId}`, error.message);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteCloudinaryImage
};
