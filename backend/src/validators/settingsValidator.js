const { z } = require('zod');

const updateSettingsSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(2).max(100).optional(),
    tagline: z.string().trim().max(150).optional(),
    description: z.string().trim().max(1000).optional(),
    phone: z.string().trim().max(20).optional(),
    whatsapp: z.string().trim().max(20).optional(),
    email: z.string().trim().email('Invalid email address').optional(),
    address: z.string().trim().max(250).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
    socialLinks: z
      .object({
        instagram: z.string().trim().optional(),
        linkedin: z.string().trim().optional(),
        facebook: z.string().trim().optional(),
        youtube: z.string().trim().optional()
      })
      .optional(),
    businessHours: z.string().trim().max(100).optional(),
    seoTitle: z.string().trim().max(150).optional(),
    seoDescription: z.string().trim().max(300).optional()
  })
});

module.exports = {
  updateSettingsSchema
};
