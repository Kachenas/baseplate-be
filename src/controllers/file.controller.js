const fileService = require('../services/file.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Get presigned URL for file upload
 * POST /api/files/presign-upload
 */
const getPresignedUploadUrl = asyncHandler(async (req, res) => {
  const { filename, contentType, size } = req.body;

  const result = await fileService.getPresignedUploadUrl(req.user._id, {
    filename,
    contentType,
    size,
  });

  res.status(200).json({
    success: true,
    message: 'Presigned upload URL generated',
    data: result,
  });
});

/**
 * Confirm file upload after successful S3 upload
 * POST /api/files/confirm-upload
 */
const confirmUpload = asyncHandler(async (req, res) => {
  const { key, filename, size } = req.body;

  const file = await fileService.confirmUpload(req.user._id, {
    key,
    filename,
    size,
  });

  res.status(201).json({
    success: true,
    message: 'File upload confirmed',
    data: { file },
  });
});

/**
 * Get presigned URL for file download
 * GET /api/files/:fileId/download
 */
const getDownloadUrl = asyncHandler(async (req, res) => {
  const result = await fileService.getPresignedDownloadUrl(
    req.user._id,
    req.params.fileId
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Delete a file
 * DELETE /api/files/:fileId
 */
const deleteFile = asyncHandler(async (req, res) => {
  await fileService.deleteFile(req.user._id, req.params.fileId);

  res.status(200).json({
    success: true,
    message: 'File deleted successfully',
  });
});

/**
 * Get user files
 * GET /api/files
 */
const getUserFiles = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;

  const result = await fileService.getUserFiles(req.user._id, {
    page,
    limit,
    sort,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

module.exports = {
  getPresignedUploadUrl,
  confirmUpload,
  getDownloadUrl,
  deleteFile,
  getUserFiles,
};
