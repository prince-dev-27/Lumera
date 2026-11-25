const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  syncWishlist
} = require('../controllers/wishlistController');

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.post('/move-to-cart', moveToCart);
router.post('/sync', syncWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

module.exports = router;
