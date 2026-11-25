const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  getMe,
  changePassword,
  refreshToken
} = require('../controllers/authController');

const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');
const { loginSchema, changePasswordSchema } = require('../validators/authValidator');

// Public auth endpoints
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);

// Protected admin endpoints
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);

module.exports = router;
