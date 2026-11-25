const express = require('express');
const router = express.Router();

const {
  getPublishedProducts,
  getFeaturedProducts,
  getProductBySlug,
  getAllAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');

// Public endpoints
router.get('/', getPublishedProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);

// Admin endpoints (Protected)
router.get('/admin/list', requireAuth, getAllAdminProducts);
router.post('/admin', requireAuth, validate(createProductSchema), createProduct);
router.get('/admin/:id', requireAuth, getAdminProductById);
router.put('/admin/:id', requireAuth, validate(updateProductSchema), updateProduct);
router.delete('/admin/:id', requireAuth, deleteProduct);

module.exports = router;
