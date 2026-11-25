const express = require('express');
const router = express.Router();
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

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
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
