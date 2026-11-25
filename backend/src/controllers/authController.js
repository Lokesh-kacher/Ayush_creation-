const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/tokenUtils');
const env = require('../config/env');

// Cookie options
const getCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: maxAgeMs
});

/**
 * Admin Login
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Query admin with passwordHash included
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check active status
  if (!admin.isActive) {
    throw new ApiError(403, 'Your admin account has been deactivated. Please contact support.');
  }

  // Verify password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken(admin);
  const refreshToken = generateRefreshToken(admin);

  // Store refresh token and update last login
  admin.refreshToken = refreshToken;
  admin.lastLogin = new Date();
  await admin.save();

  // Set cookies
  res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
  res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

  res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: admin.toJSON(),
        accessToken,
        refreshToken
      },
      'Welcome back, ' + admin.name + '! Login successful.'
    )
  );
});

/**
 * Admin Logout
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  if (req.admin) {
    req.admin.refreshToken = null;
    await req.admin.save();
  }

  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

/**
 * Get Current Authenticated Admin
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { admin: req.admin }, 'Current admin profile retrieved')
  );
});

/**
 * Change Admin Password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  if (!admin) {
    throw new ApiError(404, 'Admin account not found');
  }

  // Verify current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password cannot be identical to current password');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  admin.passwordHash = await bcrypt.hash(newPassword, salt);
  admin.refreshToken = null; // Invalidate current session refresh tokens
  await admin.save();

  res.status(200).json(
    new ApiResponse(200, null, 'Password updated successfully. Please log in with your new password.')
  );
});

/**
 * Refresh Access Token
 * POST /api/v1/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    (req.cookies && req.cookies.refreshToken) || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const admin = await Admin.findById(decoded.id).select('+refreshToken');
  if (!admin || !admin.isActive || admin.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token has been invalidated or expired');
  }

  const newAccessToken = generateAccessToken(admin);
  const newRefreshToken = generateRefreshToken(admin);

  admin.refreshToken = newRefreshToken;
  await admin.save();

  res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      },
      'Access token refreshed successfully'
    )
  );
});

module.exports = {
  login,
  logout,
  getMe,
  changePassword,
  refreshToken
};
