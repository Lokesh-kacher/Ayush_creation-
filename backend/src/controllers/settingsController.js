const Settings = require('../models/Settings');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Public: Get company public settings
 * GET /api/v1/settings
 */
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  const publicData = {
    companyName: settings.companyName,
    tagline: settings.tagline,
    description: settings.description,
    logo: settings.logo,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    state: settings.state,
    pincode: settings.pincode,
    socialLinks: settings.socialLinks,
    businessHours: settings.businessHours,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription
  };

  res.status(200).json(new ApiResponse(200, publicData, 'Company settings retrieved'));
});

/**
 * Admin: Get full settings
 * GET /api/v1/admin/settings
 */
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  res.status(200).json(new ApiResponse(200, settings, 'Admin settings retrieved'));
});

/**
 * Admin: Update company settings
 * PUT /api/v1/admin/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  Object.assign(settings, req.body);
  await settings.save();

  res.status(200).json(new ApiResponse(200, settings, 'Company settings updated successfully'));
});

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSettings
};
