const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon
} = require('../controllers/couponController');

const { protect, admin } = require('../middleware/authMiddleware');

// Customer validation route
router.post('/validate', validateCoupon);

// Admin routes
router.use(protect, admin);
router.route('/').post(createCoupon).get(getAllCoupons);
router.route('/:id').get(getCouponById).put(updateCoupon).delete(deleteCoupon);
router.patch('/:id/toggle', toggleCouponStatus);

module.exports = router;
