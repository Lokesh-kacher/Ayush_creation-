const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

// Protected admin dashboard analytics
router.get('/', requireAuth, getDashboardStats);

module.exports = router;
