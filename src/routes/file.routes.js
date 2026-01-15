const express = require('express');
const fileController = require('../controllers/file.controller');
const { validate } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const {
  presignUploadSchema,
  confirmUploadSchema,
  fileIdParamSchema,
  fileQuerySchema,
} = require('../schemas/file.schema');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get user files
router.get('/', validate(fileQuerySchema, 'query'), fileController.getUserFiles);

// Get presigned upload URL
router.post(
  '/presign-upload',
  uploadLimiter,
  validate(presignUploadSchema),
  fileController.getPresignedUploadUrl
);

// Confirm file upload
router.post(
  '/confirm-upload',
  validate(confirmUploadSchema),
  fileController.confirmUpload
);

// Get download URL
router.get(
  '/:fileId/download',
  validate(fileIdParamSchema, 'params'),
  fileController.getDownloadUrl
);

// Delete file
router.delete(
  '/:fileId',
  validate(fileIdParamSchema, 'params'),
  fileController.deleteFile
);

module.exports = router;
