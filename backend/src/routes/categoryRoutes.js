const express = require('express');
const router = express.Router();

const {
  getActiveCategories,
  getAllAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');

// Public routes
router.get('/', getActiveCategories);

// Admin routes (Protected)
router.get('/admin', requireAuth, getAllAdminCategories);
router.post('/admin', requireAuth, validate(createCategorySchema), createCategory);
router.put('/admin/:id', requireAuth, validate(updateCategorySchema), updateCategory);
router.delete('/admin/:id', requireAuth, deleteCategory);

module.exports = router;
