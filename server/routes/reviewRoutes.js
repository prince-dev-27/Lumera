const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  checkReviewEligibility,
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
} = require('../controllers/reviewController');

const { protect, admin } = require('../middleware/authMiddleware');

// Product-specific review routes (e.g. /api/products/:productId/reviews)
router
  .route('/reviews')
  .get(getProductReviews)
  .post(protect, createReview);

router.get('/review-eligibility', protect, checkReviewEligibility);

// Global admin review routes (e.g. /api/reviews)
router.get('/', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, updateReviewStatus);
router.delete('/:id', protect, deleteReview);

module.exports = router;
