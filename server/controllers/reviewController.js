const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * Helper to update product average rating & numReviews
 */
async function updateProductRating(productId) {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? Math.round((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews) * 10) / 10
      : 0;

  await Product.findByIdAndUpdate(productId, { rating, numReviews });
}

/**
 * @desc    Check customer review eligibility for a product
 * @route   GET /api/products/:productId/review-eligibility
 * @access  Private (Customer)
 */
const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if customer has placed an order containing this product
  const purchasedOrder = await Order.findOne({
    user: req.user._id,
    'orderItems.product': productId,
    orderStatus: { $ne: 'Cancelled' }
  });

  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  res.status(200).json({
    success: true,
    data: {
      canReview: Boolean(purchasedOrder),
      hasReviewed: Boolean(existingReview),
      review: existingReview || null
    }
  });
});

/**
 * @desc    Create product review (Only for customers who purchased the product)
 * @route   POST /api/products/:productId/reviews
 * @access  Private (Customer)
 */
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment || comment.trim() === '') {
    res.status(400);
    throw new Error('Please provide rating and review comment');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Mandatory eligibility check: Customer must have purchased this product
  const purchasedOrder = await Order.findOne({
    user: req.user._id,
    'orderItems.product': productId,
    orderStatus: { $ne: 'Cancelled' }
  });

  if (!purchasedOrder) {
    res.status(403);
    throw new Error('Only customers who have purchased this product can leave a review.');
  }

  // Check if user has already reviewed
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });

  let review;
  if (existingReview) {
    // Update existing review
    existingReview.rating = Number(rating);
    existingReview.comment = comment.trim();
    review = await existingReview.save();
  } else {
    // Create new review
    review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
      isApproved: true
    });
  }

  // Update product aggregated rating and numReviews
  await updateProductRating(productId);

  res.status(201).json({
    success: true,
    message: existingReview ? 'Review updated successfully' : 'Review submitted successfully',
    data: review
  });
});

/**
 * @desc    Get reviews for a product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

/**
 * @desc    Get all reviews across all products (Admin)
 * @route   GET /api/reviews
 * @access  Private (Admin)
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate('user', 'name email')
    .populate('product', 'name images price category')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

/**
 * @desc    Toggle review approval status (Admin)
 * @route   PUT /api/reviews/:id/approve
 * @access  Private (Admin)
 */
const updateReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  review.isApproved = req.body.isApproved !== undefined ? Boolean(req.body.isApproved) : !review.isApproved;
  const updatedReview = await review.save();

  await updateProductRating(review.product);

  res.status(200).json({
    success: true,
    message: `Review ${updatedReview.isApproved ? 'approved' : 'unapproved'} successfully`,
    data: updatedReview
  });
});

/**
 * @desc    Delete a review (Admin or Review Owner)
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // User can delete their own review, or admin can delete any review
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();

  await updateProductRating(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

module.exports = {
  checkReviewEligibility,
  createReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview
};
