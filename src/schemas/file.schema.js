const { z } = require('zod');
const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } = require('../middleware/upload');

const presignUploadSchema = z.object({
  filename: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename cannot exceed 255 characters')
    .trim(),
  contentType: z.enum(ALLOWED_MIME_TYPES, {
    errorMap: () => ({ message: 'Invalid file type' }),
  }),
  size: z
    .number()
    .positive('File size must be positive')
    .max(MAX_FILE_SIZE, `File size cannot exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    .optional(),
});

const confirmUploadSchema = z.object({
  key: z.string().min(1, 'File key is required'),
  filename: z.string().min(1, 'Filename is required').trim(),
  size: z.number().positive('File size must be positive'),
});

const fileIdParamSchema = z.object({
  fileId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid file ID'),
});

const fileQuerySchema = z.object({
  page: z.string().transform(Number).optional().default('1'),
  limit: z.string().transform(Number).optional().default('20'),
  sort: z.enum(['createdAt', '-createdAt', 'size', '-size']).optional().default('-createdAt'),
});

module.exports = {
  presignUploadSchema,
  confirmUploadSchema,
  fileIdParamSchema,
  fileQuerySchema,
};
