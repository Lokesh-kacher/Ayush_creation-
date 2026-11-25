const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');

/**
 * Public: Get published products with search, category filtering & pagination
 * GET /api/v1/products
 */
const getPublishedProducts = asyncHandler(async (req, res) => {
  const { search, category, model, sort, page = 1, limit = 12 } = req.query;

  const query = { status: 'published' };

  // Category filter by ID or Slug
  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase() });
      if (catDoc) {
        query.category = catDoc._id;
      }
    }
  }

  // Manufacturing model filter (job-work, complete-manufacturing)
  if (model) {
    query['specifications.manufacturingModels'] = model;
  }

  // Text search on name & descriptions
  if (search && search.trim()) {
    query.$text = { $search: search.trim() };
  }

  // Sorting
  let sortOption = { sortOrder: 1, createdAt: -1 };
  if (sort === 'newest') sortOption = { createdAt: -1 };
  if (sort === 'name-asc') sortOption = { name: 1 };
  if (sort === 'name-desc') sortOption = { name: -1 };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 12, 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json(
    new ApiResponse(
      200,
      products,
      'Published products retrieved',
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    )
  );
});

/**
 * Public: Get featured products
 * GET /api/v1/products/featured
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: 'published', featured: true })
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(6)
    .lean();

  res.status(200).json(new ApiResponse(200, products, 'Featured products retrieved'));
});

/**
 * Public: Get single product by slug
 * GET /api/v1/products/:slug
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, status: 'published' })
    .populate('category', 'name slug description')
    .lean();

  if (!product) {
    throw new ApiError(404, `Product not found with slug: ${slug}`);
  }

  res.status(200).json(new ApiResponse(200, product, 'Product details retrieved'));
});

/**
 * Admin: Get all products (draft + published) with filters & pagination
 * GET /api/v1/admin/products
 */
const getAllAdminProducts = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status && ['draft', 'published'].includes(status)) {
    query.status = status;
  }
  if (category) {
    query.category = category;
  }
  if (search && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      products,
      'Admin products retrieved',
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    )
  );
});

/**
 * Admin: Get single product by ID
 * GET /api/v1/admin/products/:id
 */
const getAdminProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(new ApiResponse(200, product, 'Product retrieved'));
});

/**
 * Admin: Create product
 * POST /api/v1/admin/products
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    shortDescription,
    description,
    status,
    featured,
    sortOrder,
    images,
    specifications
  } = req.body;

  // Verify category exists
  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    throw new ApiError(400, 'Invalid category selected. Category does not exist.');
  }

  // Generate unique slug
  let slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
  let slugExists = await Product.findOne({ slug });
  if (slugExists) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const product = await Product.create({
    name,
    slug,
    category,
    shortDescription: shortDescription || '',
    description,
    status: status || 'draft',
    featured: featured || false,
    sortOrder: sortOrder || 0,
    images: images || [],
    specifications: specifications || {}
  });

  const populated = await Product.findById(product._id).populate('category', 'name slug');
  res.status(201).json(new ApiResponse(201, populated, 'Product created successfully'));
});

/**
 * Admin: Update product
 * PUT /api/v1/admin/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (updates.category) {
    const categoryDoc = await Category.findById(updates.category);
    if (!categoryDoc) {
      throw new ApiError(400, 'Invalid category selected.');
    }
  }

  // If slug changed or name changed without slug
  if (updates.slug && updates.slug !== product.slug) {
    let newSlug = slugify(updates.slug);
    const existing = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existing) {
      newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
    }
    updates.slug = newSlug;
  }

  Object.assign(product, updates);
  await product.save();

  const populated = await Product.findById(product._id).populate('category', 'name slug');
  res.status(200).json(new ApiResponse(200, populated, 'Product updated successfully'));
});

/**
 * Admin: Delete product
 * DELETE /api/v1/admin/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Optional: delete associated Cloudinary images if publicIds exist
  const { deleteCloudinaryImage } = require('../services/cloudinaryService');
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        try {
          await deleteCloudinaryImage(img.publicId);
        } catch (err) {
          console.warn('Could not delete Cloudinary image:', img.publicId, err.message);
        }
      }
    }
  }

  await product.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

module.exports = {
  getPublishedProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAllAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
