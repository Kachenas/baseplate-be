const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');

/**
 * Generate access and refresh tokens
 * @param {string} userId
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

/**
 * Register a new user
 * @param {Object} userData
 */
const register = async ({ email, password, name }) => {
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({
    email,
    password,
    name,
  });

  const tokens = generateTokens(user._id.toString());

  // Save refresh token to user
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

/**
 * Login user
 * @param {Object} credentials
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = generateTokens(user._id.toString());

  // Update refresh token and last login
  user.refreshToken = tokens.refreshToken;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user._id.toString());

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    throw error;
  }
};

/**
 * Logout user
 * @param {string} userId
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * Change password
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshToken = null; // Invalidate all sessions
  await user.save();
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  changePassword,
};
