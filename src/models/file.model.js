const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'S3 key is required'],
      unique: true,
    },
    bucket: {
      type: String,
      required: [true, 'Bucket name is required'],
    },
    mimetype: {
      type: String,
      required: [true, 'Mimetype is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ key: 1 });

// Virtual for formatted file size
fileSchema.virtual('formattedSize').get(function () {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Static method to find user files
fileSchema.statics.findByUser = function (userId, options = {}) {
  const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;
  return this.find({ userId }).sort(sort).skip(skip).limit(limit);
};

const File = mongoose.model('File', fileSchema);

module.exports = File;
