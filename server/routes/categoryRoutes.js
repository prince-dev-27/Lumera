const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: list
// Private/Admin: create
router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

// Public: get by id/slug
// Private/Admin: update, delete
router.route('/:id')
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
