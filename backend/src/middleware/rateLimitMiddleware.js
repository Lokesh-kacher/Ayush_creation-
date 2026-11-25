const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

/**
 * General API Limiter (200 requests per 15 minutes)
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many requests from this IP. Please try again after 15 minutes.'));
  }
});

/**
 * Strict Auth Limiter for Login (5 attempts per 15 minutes)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts from this IP. Please wait 15 minutes before trying again.'));
  }
});

/**
 * Public Enquiry Submission Limiter (10 submissions per hour)
 */
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Enquiry rate limit exceeded. Please contact us directly on WhatsApp (+91 7524890613).'));
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  enquiryLimiter
};
