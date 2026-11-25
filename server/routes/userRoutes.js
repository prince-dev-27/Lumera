const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Brute-force rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

// Public authentication routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);

// Protected user routes
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Admin-only user routes & general user collection
router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById);

module.exports = router;
