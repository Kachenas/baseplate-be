const express = require('express');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validate');
const { verifyToken, requireRoles } = require('../middleware/auth.middleware');
const {
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} = require('../schemas/user.schema');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Current user routes
router.get('/me', userController.getMe);

router.patch('/me', validate(updateUserSchema), userController.updateMe);

router.delete('/me', userController.deleteMe);

// Admin routes
router.get(
  '/',
  requireRoles('admin'),
  validate(userQuerySchema, 'query'),
  userController.getUsers
);

router.get(
  '/:userId',
  requireRoles('admin'),
  validate(userIdParamSchema, 'params'),
  userController.getUserById
);

module.exports = router;
