const { z } = require('zod');

const submitEnquirySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Your name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    businessName: z.string().trim().max(150).optional().default(''),
    email: z
      .string()
      .trim()
      .email('Please provide a valid email address')
      .optional()
      .or(z.literal('')),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(/^[0-9+\s-]{8,16}$/, 'Please enter a valid phone number (minimum 8-10 digits)'),
    customerType: z
      .enum(['school', 'retailer', 'wholesaler', 'institution', 'other'])
      .optional()
      .default('school'),
    product: z
      .string({ required_error: 'Product requirement is required' })
      .trim()
      .min(2, 'Product requirement is required'),
    quantity: z
      .string({ required_error: 'Approximate quantity is required' })
      .trim()
      .min(1, 'Quantity is required'),
    manufacturingModel: z
      .enum(['job-work', 'complete-manufacturing', 'not-specified'])
      .optional()
      .default('complete-manufacturing'),
    message: z.string().trim().max(2000).optional().default('')
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'new',
      'contacted',
      'qualified',
      'quotation-sent',
      'follow-up',
      'converted',
      'closed'
    ])
  })
});

const addNoteSchema = z.object({
  body: z.object({
    note: z
      .string({ required_error: 'Note content is required' })
      .trim()
      .min(1, 'Note cannot be empty')
      .max(1000, 'Note is too long')
  })
});

module.exports = {
  submitEnquirySchema,
  updateStatusSchema,
  addNoteSchema
};
