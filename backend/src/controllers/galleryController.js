const Gallery = require('../models/Gallery');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteCloudinaryImage } = require('../services/cloudinaryService');

/**
 * Public: Get published gallery images
 * GET /api/v1/gallery
 */
const getPublishedGallery = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const query = { isPublished: true };
  if (category && category !== 'all') {
    query.category = category.toLowerCase();
  }

  const items = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, items, 'Gallery images retrieved'));
});

/**
 * Admin: Get all gallery items
 * GET /api/v1/admin/gallery
 */
const getAllAdminGallery = asyncHandler(async (req, res) => {
  const { category, isPublished } = req.query;

  const query = {};
  if (category) query.category = category;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';

  const items = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();

  res.status(200).json(new ApiResponse(200, items, 'Admin gallery items retrieved'));
});

/**
 * Admin: Create gallery item
 * POST /api/v1/admin/gallery
 */
const createGalleryItem = asyncHandler(async (req, res) => {
  const { title, description, category, isPublished, sortOrder, imageUrl } = req.body;

  let finalImageUrl = imageUrl;
  let finalPublicId = '';

  // If file was uploaded via multipart/form-data
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'gallery');
    finalImageUrl = uploadResult.url;
    finalPublicId = uploadResult.publicId;
  }

  if (!finalImageUrl) {
    throw new ApiError(400, 'Please provide an image URL or upload an image file');
  }

  const item = await Gallery.create({
    title,
    description: description || '',
    category: category || 'factory',
    imageUrl: finalImageUrl,
    cloudinaryPublicId: finalPublicId,
    isPublished: isPublished !== undefined ? isPublished === 'true' || isPublished === true : true,
    sortOrder: parseInt(sortOrder, 10) || 0
  });

  res.status(201).json(new ApiResponse(201, item, 'Gallery item created successfully'));
});

/**
 * Admin: Update gallery item
 * PUT /api/v1/admin/gallery/:id
 */
const updateGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, 'Gallery item not found');
  }

  // If a new image was uploaded
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'gallery');
    // Delete old image from Cloudinary
    if (item.cloudinaryPublicId) {
      await deleteCloudinaryImage(item.cloudinaryPublicId);
    }
    item.imageUrl = uploadResult.url;
    item.cloudinaryPublicId = uploadResult.publicId;
  }

  if (updates.title) item.title = updates.title;
  if (updates.description !== undefined) item.description = updates.description;
  if (updates.category) item.category = updates.category;
  if (updates.isPublished !== undefined) {
    item.isPublished = updates.isPublished === 'true' || updates.isPublished === true;
  }
  if (updates.sortOrder !== undefined) item.sortOrder = parseInt(updates.sortOrder, 10) || 0;

  await item.save();

  res.status(200).json(new ApiResponse(200, item, 'Gallery item updated successfully'));
});

/**
 * Admin: Delete gallery item
 * DELETE /api/v1/admin/gallery/:id
 */
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, 'Gallery item not found');
  }

  if (item.cloudinaryPublicId) {
    await deleteCloudinaryImage(item.cloudinaryPublicId);
  }

  await item.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Gallery item deleted successfully'));
});

module.exports = {
  getPublishedGallery,
  getAllAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
