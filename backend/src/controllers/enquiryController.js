const Enquiry = require('../models/Enquiry');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendEnquiryAlert } = require('../services/emailService');

/**
 * Public: Submit a new B2B Quotation Enquiry
 * POST /api/v1/enquiries
 */
const submitEnquiry = asyncHandler(async (req, res) => {
  const {
    name,
    businessName,
    email,
    phone,
    customerType,
    product,
    quantity,
    manufacturingModel,
    message
  } = req.body;

  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  const enquiry = await Enquiry.create({
    name,
    businessName: businessName || '',
    email: email || '',
    phone,
    customerType: customerType || 'school',
    product,
    quantity,
    manufacturingModel: manufacturingModel || 'complete-manufacturing',
    message: message || '',
    ipAddress,
    status: 'new',
    source: 'website'
  });

  // Asynchronously trigger optional email alert without blocking response
  sendEnquiryAlert(enquiry).catch((err) =>
    console.warn('Background email notification error:', err.message)
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        enquiryNumber: enquiry.enquiryNumber,
        name: enquiry.name,
        product: enquiry.product,
        createdAt: enquiry.createdAt
      },
      'Thank you! Your quotation request has been received. Our team will review your requirement and reach out within 24 hours.'
    )
  );
});

/**
 * Admin: Get all enquiries with filtering, search & pagination
 * GET /api/v1/admin/enquiries
 */
const getAllEnquiries = asyncHandler(async (req, res) => {
  const { status, customerType, model, search, page = 1, limit = 20 } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }
  if (customerType) {
    query.customerType = customerType;
  }
  if (model) {
    query.manufacturingModel = model;
  }
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { enquiryNumber: { $regex: s, $options: 'i' } },
      { name: { $regex: s, $options: 'i' } },
      { businessName: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { product: { $regex: s, $options: 'i' } }
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const [enquiries, total] = await Promise.all([
    Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Enquiry.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      enquiries,
      'Enquiries retrieved successfully',
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    )
  );
});

/**
 * Admin: Get single enquiry details
 * GET /api/v1/admin/enquiries/:id
 */
const getEnquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found');
  }

  res.status(200).json(new ApiResponse(200, enquiry, 'Enquiry details retrieved'));
});

/**
 * Admin: Update enquiry status
 * PATCH /api/v1/admin/enquiries/:id/status
 */
const updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found');
  }

  const oldStatus = enquiry.status;
  enquiry.status = status;

  // Add system audit note
  enquiry.notes.push({
    note: `Status changed from "${oldStatus}" to "${status}"`,
    createdBy: req.admin ? req.admin.name : 'Admin',
    createdAt: new Date()
  });

  await enquiry.save();

  res.status(200).json(
    new ApiResponse(200, enquiry, `Enquiry status updated to ${status}`)
  );
});

/**
 * Admin: Append internal note to enquiry
 * PATCH /api/v1/admin/enquiries/:id/notes
 */
const addEnquiryNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const enquiry = await Enquiry.findById(id);
  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found');
  }

  enquiry.notes.push({
    note,
    createdBy: req.admin ? req.admin.name : 'Admin',
    createdAt: new Date()
  });

  await enquiry.save();

  res.status(200).json(new ApiResponse(200, enquiry, 'Note added successfully'));
});

/**
 * Admin: Delete enquiry
 * DELETE /api/v1/admin/enquiries/:id
 */
const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findByIdAndDelete(id);
  if (!enquiry) {
    throw new ApiError(404, 'Enquiry not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Enquiry deleted successfully'));
});

module.exports = {
  submitEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addEnquiryNote,
  deleteEnquiry
};
