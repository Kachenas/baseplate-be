const userService = require('../services/user.service');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * Update current user profile
 * PATCH /api/users/me
 */
const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

/**
 * Delete current user account
 * DELETE /api/users/me
 */
const deleteMe = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

/**
 * Get all users (admin only)
 * GET /api/users
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, sort } = req.query;

  const result = await userService.getUsers({ page, limit, sort });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get user by ID (admin only)
 * GET /api/users/:userId
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = {
  getMe,
  updateMe,
  deleteMe,
  getUsers,
  getUserById,
};
