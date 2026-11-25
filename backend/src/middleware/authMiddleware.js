const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/tokenUtils');
const Admin = require('../models/Admin');

const requireAuth = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // 2. Check HttpOnly cookie
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, 'Authentication required. Please log in to access this resource.');
  }

  // 3. Verify Token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Your session has expired. Please log in again.');
    }
    throw new ApiError(401, 'Invalid authentication token.');
  }

  // 4. Verify admin exists and is active
  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    throw new ApiError(401, 'Admin account no longer exists.');
  }

  if (!admin.isActive) {
    throw new ApiError(403, 'Your admin account has been deactivated. Please contact support.');
  }

  // Attach authenticated admin to request
  req.admin = admin;
  next();
});

module.exports = {
  requireAuth
};
