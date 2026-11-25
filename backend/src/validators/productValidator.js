const { z } = require('zod');

const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name cannot exceed 150 characters'),
    slug: z.string().trim().optional(),
    category: z.string({ required_error: 'Category ID is required' }).trim(),
    shortDescription: z.string().trim().max(300).optional().default(''),
    description: z
      .string({ required_error: 'Product description is required' })
      .trim()
      .min(5, 'Description must be at least 5 characters'),
    status: z.enum(['draft', 'published']).optional().default('draft'),
    featured: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
    images: z
      .array(
        z.object({
          url: z.string().url('Valid image URL required'),
          publicId: z.string().optional().default(''),
          isPrimary: z.boolean().optional().default(false),
          alt: z.string().optional().default('')
        })
      )
      .optional()
      .default([]),
    specifications: z
      .object({
        fabric: z.string().optional().default(''),
        fabricComposition: z.string().optional().default(''),
        gsm: z.string().optional().default(''),
        availableSizes: z.array(z.string()).optional().default([]),
        colour: z.array(z.string()).optional().default([]),
        customisation: z.string().optional().default(''),
        productType: z.string().optional().default(''),
        manufacturingModels: z.array(z.string()).optional().default([])
      })
      .optional()
      .default({})
  })
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(150).optional(),
    slug: z.string().trim().optional(),
    category: z.string().trim().optional(),
    shortDescription: z.string().trim().max(300).optional(),
    description: z.string().trim().min(5).optional(),
    status: z.enum(['draft', 'published']).optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    images: z
      .array(
        z.object({
          url: z.string().url(),
          publicId: z.string().optional().default(''),
          isPrimary: z.boolean().optional().default(false),
          alt: z.string().optional().default('')
        })
      )
      .optional(),
    specifications: z
      .object({
        fabric: z.string().optional(),
        fabricComposition: z.string().optional(),
        gsm: z.string().optional(),
        availableSizes: z.array(z.string()).optional(),
        colour: z.array(z.string()).optional(),
        customisation: z.string().optional(),
        productType: z.string().optional(),
        manufacturingModels: z.array(z.string()).optional()
      })
      .optional()
  })
});

module.exports = {
  createProductSchema,
  updateProductSchema
};
