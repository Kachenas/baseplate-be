const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');

/**
 * Get user by ID
 * @param {string} userId
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId
 * @param {Object} updateData
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * Delete user account
 * @param {string} userId
 */
const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * Get all users (admin only)
 * @param {Object} options
 */
const getUsers = async (options = {}) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = options;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().sort(sort).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getUserById,
  updateUser,
  deleteUser,
  getUsers,
};
