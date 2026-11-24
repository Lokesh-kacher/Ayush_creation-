const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Ayush Creation B2B Garment Manufacturing API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + ' seconds'
  });
});

// Enquiry routes
router.post('/enquiries', enquiryController.createEnquiry);
router.post('/contact', enquiryController.createEnquiry); // alias for /api/contact
router.get('/enquiries', enquiryController.getAllEnquiries);
router.get('/stats', enquiryController.getStats);

// Products catalog metadata endpoint
router.get('/products', (req, res) => {
  res.json({
    success: true,
    categories: [
      {
        id: 'school-shirts',
        name: 'School Shirts',
        types: ['Half Sleeve', 'Full Sleeve', 'Formal Collared'],
        suitableFor: 'Boys & Girls',
        minOrderQty: 'Job-work: As agreed / Complete: Bulk'
      },
      {
        id: 'school-trousers',
        name: 'School Trousers',
        types: ['Pleated', 'Flat Front', 'Elastic Waistband options'],
        suitableFor: 'Boys'
      },
      {
        id: 'girls-skirts',
        name: "Girls' Skirts & Tunics",
        types: ['Box Pleat', 'Knife Pleat', 'Pinafore / Tunics'],
        suitableFor: 'Girls'
      },
      {
        id: 'sports-tshirts',
        name: 'Sports T-Shirts',
        types: ['Dry-Fit', 'Polyester-Cotton', 'House Uniforms'],
        suitableFor: 'Unisex Athletic'
      },
      {
        id: 'track-pants',
        name: 'Track Pants',
        types: ['Regular Fit', 'Zippered Pockets', 'Custom Side Piping'],
        suitableFor: 'Sports & Winter'
      },
      {
        id: 'custom-uniforms',
        name: 'Custom Institutional Uniforms',
        types: ['Blazers', 'Lab Coats', 'Staff Uniforms'],
        suitableFor: 'Institutions & Retailers'
      }
    ],
    manufacturingModels: [
      {
        model: 'Job-work manufacturing',
        description: 'Customer provides fabric & agreed trims; Ayush Creation handles pattern cutting, stitching, finishing & packing.'
      },
      {
        model: 'Complete manufacturing',
        description: 'Turnkey solution where Ayush Creation sources fabric & trims, manufactures, finishes and delivers complete orders.'
      }
    ]
  });
});

module.exports = router;
