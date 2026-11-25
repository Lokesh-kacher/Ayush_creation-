const express = require('express');
const router = express.Router();

const {
  getPublishedGallery,
  getAllAdminGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');

const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route
router.get('/', getPublishedGallery);

// Admin routes (Protected)
router.get('/admin', requireAuth, getAllAdminGallery);
router.post('/admin', requireAuth, upload.single('image'), createGalleryItem);
router.put('/admin/:id', requireAuth, upload.single('image'), updateGalleryItem);
router.delete('/admin/:id', requireAuth, deleteGalleryItem);

module.exports = router;
