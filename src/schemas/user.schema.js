const { z } = require('zod');

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim()
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
});

const userIdParamSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

const userQuerySchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
  sort: z.enum(['createdAt', '-createdAt', 'name', '-name']).optional().default('-createdAt'),
});

module.exports = {
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
};
