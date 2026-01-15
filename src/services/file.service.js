const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const { s3Client } = require('../config/s3');
const { env } = require('../config/env');
const File = require('../models/file.model');
const { ApiError } = require('../utils/ApiError');

const PRESIGNED_URL_EXPIRES_IN = 3600; // 1 hour

/**
 * Generate a unique S3 key for a file
 * @param {string} userId
 * @param {string} filename
 */
const generateS3Key = (userId, filename) => {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = filename.split('.').pop();
  return `uploads/${userId}/${timestamp}-${randomId}.${ext}`;
};

/**
 * Generate a presigned URL for uploading a file to S3
 * @param {string} userId
 * @param {{filename: string, contentType: string, size?: number}} fileData
 */
const getPresignedUploadUrl = async (userId, { filename, contentType }) => {
  const key = generateS3Key(userId, filename);

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  return {
    uploadUrl,
    key,
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  };
};

/**
 * Confirm file upload after successful S3 upload
 * @param {string} userId
 * @param {{key: string, filename: string, size: number}} fileData
 */
const confirmUpload = async (userId, { key, filename, size }) => {
  // Extract content type from key extension
  const ext = (key.split('.').pop() || '').toLowerCase();
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    csv: 'text/csv',
  };

  const mimetype = mimeTypes[/** @type {keyof typeof mimeTypes} */ (ext)] || 'application/octet-stream';

  const file = await File.create({
    userId,
    filename: key.split('/').pop(),
    originalName: filename,
    key,
    bucket: env.S3_BUCKET,
    mimetype,
    size,
  });

  return file;
};

/**
 * Get a presigned URL for downloading a file
 * @param {string} userId
 * @param {string} fileId
 */
const getPresignedDownloadUrl = async (userId, fileId) => {
  const file = await File.findById(fileId);

  if (!file) {
    throw ApiError.notFound('File not found');
  }

  // Check ownership unless file is public
  if (!file.isPublic && file.userId?.toString() !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  const command = new GetObjectCommand({
    Bucket: /** @type {string} */ (file.bucket),
    Key: /** @type {string} */ (file.key),
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  });

  return {
    downloadUrl,
    file,
    expiresIn: PRESIGNED_URL_EXPIRES_IN,
  };
};

/**
 * Delete a file from S3 and database
 * @param {string} userId
 * @param {string} fileId
 */
const deleteFile = async (userId, fileId) => {
  const file = await File.findById(fileId);

  if (!file) {
    throw ApiError.notFound('File not found');
  }

  if (file.userId?.toString() !== userId) {
    throw ApiError.forbidden('Access denied');
  }

  // Delete from S3
  const command = new DeleteObjectCommand({
    Bucket: /** @type {string} */ (file.bucket),
    Key: /** @type {string} */ (file.key),
  });

  await s3Client.send(command);

  // Delete from database
  await File.findByIdAndDelete(fileId);

  return file;
};

/**
 * Get user files
 * @param {string} userId
 * @param {{page?: number, limit?: number, sort?: string}} options
 */
const getUserFiles = async (userId, options = {}) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = options;

  const skip = (page - 1) * limit;

  const [files, total] = await Promise.all([
    File.find({ userId }).sort(sort).skip(skip).limit(limit),
    File.countDocuments({ userId }),
  ]);

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getPresignedUploadUrl,
  confirmUpload,
  getPresignedDownloadUrl,
  deleteFile,
  getUserFiles,
};
