const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const reviewRoutes = require('./reviewRoutes');

// Public: list & single
// Private/Admin: create
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Public: get by id/slug
// Private/Admin: update, delete
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Mount nested product review routes (/api/products/:productId/reviews & review-eligibility)
router.use('/:productId', reviewRoutes);

module.exports = router;
