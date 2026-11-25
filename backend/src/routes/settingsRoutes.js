const express = require('express');
const router = express.Router();

const {
  getPublicSettings,
  getAdminSettings,
  updateSettings
} = require('../controllers/settingsController');

const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateSettingsSchema } = require('../validators/settingsValidator');

// Public route
router.get('/', getPublicSettings);

// Admin routes (Protected)
router.get('/admin', requireAuth, getAdminSettings);
router.put('/admin', requireAuth, validate(updateSettingsSchema), updateSettings);

module.exports = router;
