const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

/**
 * Public: Get active categories
 * GET /api/v1/categories
 */
const getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, categories, 'Active categories retrieved'));
});

/**
 * Admin: Get all categories with product counts
 * GET /api/v1/admin/categories
 */
const getAllAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        isActive: 1,
        sortOrder: 1,
        createdAt: 1,
        updatedAt: 1,
        productCount: { $size: '$products' }
      }
    },
    { $sort: { sortOrder: 1, name: 1 } }
  ]);

  res.status(200).json(new ApiResponse(200, categories, 'Admin categories retrieved'));
});

/**
 * Admin: Create category
 * POST /api/v1/admin/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive, sortOrder } = req.body;
  let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

  // Check unique slug
  let slugExists = await Category.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const category = await Category.create({
    name,
    slug,
    description: description || '',
    isActive: isActive !== undefined ? isActive : true,
    sortOrder: sortOrder || 0
  });

  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

/**
 * Admin: Update category
 * PUT /api/v1/admin/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, isActive, sortOrder } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name) category.name = name;
  if (slug) category.slug = slugify(slug);
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;

  await category.save();

  res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
});

/**
 * Admin: Delete category
 * DELETE /api/v1/admin/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Prevent deleting if category has assigned products
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category "${category.name}". It is currently assigned to ${productCount} product(s). Please reassign or delete those products first.`
    );
  }

  await category.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});

module.exports = {
  getActiveCategories,
  getAllAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
