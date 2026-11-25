const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to get populated wishlist
const getPopulatedWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    populate: { path: 'category', select: 'name slug' }
  });
  if (!user) return [];
  // Filter out any deleted products
  const validWishlist = user.wishlist.filter((prod) => prod != null);
  if (validWishlist.length !== user.wishlist.length) {
    user.wishlist = validWishlist.map((p) => p._id);
    await user.save();
  }
  return validWishlist;
};

// Helper to get populated cart
const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    populate: { path: 'category', select: 'name slug' }
  });
  if (!user) return [];
  return user.cart.filter((item) => item.product != null);
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    count: wishlist.length,
    data: wishlist
  });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not available');
  }

  const user = await User.findById(req.user._id);

  const exists = user.wishlist.some(
    (id) => id.toString() === productId.toString()
  );

  if (!exists) {
    user.wishlist.push(productId);
    await user.save();
  }

  const updatedWishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Added to wishlist',
    data: updatedWishlist
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );

  await user.save();
  const updatedWishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Removed from wishlist',
    data: updatedWishlist
  });
});

// @desc    Move product from wishlist to cart
// @route   POST /api/wishlist/move-to-cart
// @access  Private
const moveToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product is no longer available');
  }

  if (product.stock <= 0) {
    res.status(400);
    throw new Error('Product is currently out of stock');
  }

  const user = await User.findById(req.user._id);

  // 1. Remove from wishlist
  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId.toString()
  );

  // 2. Add to cart
  const existingIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingIndex > -1) {
    const currentQty = user.cart[existingIndex].quantity;
    const newQty = currentQty + qty;
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(
        `Cannot move to cart. Available stock is ${product.stock} (you already have ${currentQty} in cart).`
      );
    }
    user.cart[existingIndex].quantity = newQty;
  } else {
    if (qty > product.stock) {
      res.status(400);
      throw new Error(
        `Cannot move to cart. Available stock is ${product.stock}.`
      );
    }
    user.cart.push({ product: productId, quantity: qty });
  }

  await user.save();

  const updatedWishlist = await getPopulatedWishlist(req.user._id);
  const updatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Moved product to cart',
    data: {
      wishlist: updatedWishlist,
      cart: updatedCart
    }
  });
});

// @desc    Sync guest wishlist with user wishlist
// @route   POST /api/wishlist/sync
// @access  Private
const syncWishlist = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    res.status(400);
    throw new Error('productIds must be an array');
  }

  const user = await User.findById(req.user._id);

  for (const idObj of productIds) {
    const pId = typeof idObj === 'object' ? idObj._id || idObj.id : idObj;
    if (!pId) continue;

    const product = await Product.findById(pId);
    if (!product || !product.isActive) continue;

    const exists = user.wishlist.some(
      (wId) => wId.toString() === pId.toString()
    );
    if (!exists) {
      user.wishlist.push(pId);
    }
  }

  await user.save();
  const updatedWishlist = await getPopulatedWishlist(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Wishlist synced successfully',
    data: updatedWishlist
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  syncWishlist
};
