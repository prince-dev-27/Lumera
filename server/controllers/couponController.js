const asyncHandler = require('../middleware/asyncHandler');
const Coupon = require('../models/Coupon');

/**
 * @desc    Create new coupon
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountAmount,
    minOrderAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    isActive
  } = req.body;

  if (!code || discountAmount === undefined || discountAmount === null) {
    res.status(400);
    throw new Error('Please provide coupon code and discount amount');
  }

  const cleanCode = code.trim().toUpperCase();

  const couponExists = await Coupon.findOne({ code: cleanCode });
  if (couponExists) {
    res.status(400);
    throw new Error(`Coupon with code "${cleanCode}" already exists`);
  }

  const coupon = await Coupon.create({
    code: cleanCode,
    discountType: discountType || 'percentage',
    discountAmount: Number(discountAmount),
    minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : 0,
    maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
});

/**
 * @desc    Get all coupons
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

/**
 * @desc    Get single coupon by ID
 * @route   GET /api/coupons/:id
 * @access  Private (Admin)
 */
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

/**
 * @desc    Update coupon details
 * @route   PUT /api/coupons/:id
 * @access  Private (Admin)
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  const {
    code,
    discountType,
    discountAmount,
    minOrderAmount,
    maxDiscountAmount,
    expiryDate,
    usageLimit,
    isActive
  } = req.body;

  if (code && code.trim().toUpperCase() !== coupon.code) {
    const existingCode = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existingCode && existingCode._id.toString() !== coupon._id.toString()) {
      res.status(400);
      throw new Error(`Coupon with code "${code.trim().toUpperCase()}" already exists`);
    }
    coupon.code = code.trim().toUpperCase();
  }

  if (discountType) coupon.discountType = discountType;
  if (discountAmount !== undefined) coupon.discountAmount = Number(discountAmount);
  if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
  if (maxDiscountAmount !== undefined) {
    coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
  }
  if (expiryDate !== undefined) {
    coupon.expiryDate = expiryDate ? new Date(expiryDate) : null;
  }
  if (usageLimit !== undefined) {
    coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
  }
  if (isActive !== undefined) coupon.isActive = Boolean(isActive);

  const updatedCoupon = await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: updatedCoupon
  });
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin)
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

/**
 * @desc    Toggle activate / deactivate coupon
 * @route   PATCH /api/coupons/:id/toggle
 * @access  Private (Admin)
 */
const toggleCouponStatus = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  coupon.isActive = !coupon.isActive;
  const updatedCoupon = await coupon.save();

  res.status(200).json({
    success: true,
    message: `Coupon ${updatedCoupon.isActive ? 'activated' : 'deactivated'} successfully`,
    data: updatedCoupon
  });
});

/**
 * @desc    Validate and calculate coupon discount for customer
 * @route   POST /api/coupons/validate
 * @access  Public / Private (Customer)
 */
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, itemsPrice = 0 } = req.body;

  if (!code || code.trim() === '') {
    res.status(400);
    throw new Error('Please enter a coupon code');
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon) {
    res.status(404);
    throw new Error(`Invalid coupon code "${cleanCode}"`);
  }

  // 1. Check if active
  if (!coupon.isActive) {
    res.status(400);
    throw new Error('This coupon is currently inactive');
  }

  // 2. Check expiry date
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    res.status(400);
    throw new Error('This coupon has expired');
  }

  // 3. Check minimum order amount
  const numericItemsPrice = Number(itemsPrice) || 0;
  if (numericItemsPrice < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(
      `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for coupon "${cleanCode}"`
    );
  }

  // 4. Check usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error('Coupon usage limit has been reached');
  }

  // 5. Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (numericItemsPrice * coupon.discountAmount) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = Math.min(coupon.discountAmount, numericItemsPrice);
  }

  discountAmount = Math.round(discountAmount * 100) / 100; // round to 2 decimals
  const finalPrice = Math.max(0, numericItemsPrice - discountAmount);

  res.status(200).json({
    success: true,
    valid: true,
    message: `Coupon "${cleanCode}" applied successfully!`,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountAmount,
      minOrderAmount: coupon.minOrderAmount,
      calculatedDiscount: discountAmount,
      finalPrice
    }
  });
});

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon
};
