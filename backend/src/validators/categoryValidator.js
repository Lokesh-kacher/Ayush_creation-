const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .trim()
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name cannot exceed 100 characters'),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional().default(''),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0)
  })
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional()
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
