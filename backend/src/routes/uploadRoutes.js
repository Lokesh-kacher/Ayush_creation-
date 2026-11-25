const express = require('express');
const router = express.Router();

const { uploadImages } = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected admin upload route (supports single 'image' or array 'images')
router.post('/', requireAuth, upload.array('images', 10), uploadImages);

module.exports = router;
