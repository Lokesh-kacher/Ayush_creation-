const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const Gallery = require('../models/Gallery');
const Category = require('../models/Category');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Admin: Get dashboard overview statistics & analytics
 * GET /api/v1/admin/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Parallel database aggregation queries
  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    totalCategories,
    totalGallery,
    totalEnquiries,
    newEnquiries,
    enquiriesByStatus,
    enquiriesLast7Days,
    enquiriesLast30Days,
    recentEnquiries,
    recentProducts
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'published' }),
    Product.countDocuments({ status: 'draft' }),
    Category.countDocuments({ isActive: true }),
    Gallery.countDocuments({ isPublished: true }),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: 'new' }),

    // Group enquiries by status
    Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),

    // Enquiries received in last 7 days grouped by date
    Enquiry.aggregate([
      {
        $match: { createdAt: { $gte: sevenDaysAgo } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Enquiries received in last 30 days
    Enquiry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),

    // 5 Most recent enquiries
    Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('enquiryNumber name businessName phone product status createdAt')
      .lean(),

    // 5 Most recent products
    Product.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name slug status featured category createdAt images')
      .lean()
  ]);

  // Format status counts into clean key-value dictionary
  const statusCounts = {
    new: 0,
    contacted: 0,
    qualified: 0,
    'quotation-sent': 0,
    'follow-up': 0,
    converted: 0,
    closed: 0
  };

  enquiriesByStatus.forEach(item => {
    if (statusCounts[item._id] !== undefined) {
      statusCounts[item._id] = item.count;
    }
  });

  const dashboardData = {
    summary: {
      totalProducts,
      publishedProducts,
      draftProducts,
      totalCategories,
      totalGallery,
      totalEnquiries,
      newEnquiries,
      enquiriesLast30Days
    },
    statusBreakdown: statusCounts,
    trends: {
      last7Days: enquiriesLast7Days
    },
    recentEnquiries,
    recentProducts
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Dashboard analytics retrieved'));
});

module.exports = {
  getDashboardStats
};
