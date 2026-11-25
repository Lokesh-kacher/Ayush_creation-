const express = require('express');
const router = express.Router();

const {
  submitEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addEnquiryNote,
  deleteEnquiry
} = require('../controllers/enquiryController');

const { requireAuth } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { enquiryLimiter } = require('../middleware/rateLimitMiddleware');
const {
  submitEnquirySchema,
  updateStatusSchema,
  addNoteSchema
} = require('../validators/enquiryValidator');

// Public route: submit enquiry with spam rate limiter & Zod validation
router.post('/', enquiryLimiter, validate(submitEnquirySchema), submitEnquiry);

// Admin routes (Protected)
router.get('/admin', requireAuth, getAllEnquiries);
router.get('/admin/:id', requireAuth, getEnquiryById);
router.patch('/admin/:id/status', requireAuth, validate(updateStatusSchema), updateEnquiryStatus);
router.patch('/admin/:id/notes', requireAuth, validate(addNoteSchema), addEnquiryNote);
router.delete('/admin/:id', requireAuth, deleteEnquiry);

module.exports = router;
