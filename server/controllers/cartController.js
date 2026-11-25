const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');

// Helper to populate user cart
const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    populate: { path: 'category', select: 'name slug' }
  });
  if (!user) return [];
  // Clean up any items where product was deleted
  const validCart = user.cart.filter((item) => item.product != null);
  if (validCart.length !== user.cart.length) {
    user.cart = validCart;
    await user.save();
  }
  return user.cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await getPopulatedCart(req.user._id);

  const subtotal = cart.reduce((total, item) => {
    if (!item.product) return total;
    const price = item.product.discountPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    count: cart.length,
    subtotal,
    data: cart
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId) {
    res.status(400);
    throw new Error('Please provide a product ID');
  }

  if (isNaN(qty) || qty < 1) {
    res.status(400);
    throw new Error('Quantity must be a positive number');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not available');
  }

  if (product.stock <= 0) {
    res.status(400);
    throw new Error('Product is currently out of stock');
  }

  const user = await User.findById(req.user._id);
  const existingIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    const currentQty = user.cart[existingIndex].quantity;
    const newQty = currentQty + qty;

    if (newQty > product.stock) {
      res.status(400);
      throw new Error(
        `Cannot add ${qty} more items. Only ${product.stock} available in stock (you already have ${currentQty} in bag).`
      );
    }
    user.cart[existingIndex].quantity = newQty;
  } else {
    if (qty > product.stock) {
      res.status(400);
      throw new Error(
        `Cannot add ${qty} items. Maximum available stock is ${product.stock}.`
      );
    }
    user.cart.push({ product: productId, quantity: qty });
  }

  await user.save();
  const updatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: updatedCart
  });
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (isNaN(qty)) {
    res.status(400);
    throw new Error('Valid quantity is required');
  }

  const user = await User.findById(req.user._id);
  const itemIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  if (qty <= 0) {
    user.cart.splice(itemIndex, 1);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error('Product is no longer available');
    }

    if (qty > product.stock) {
      res.status(400);
      throw new Error(
        `Cannot set quantity to ${qty}. Maximum available stock is ${product.stock}.`
      );
    }

    user.cart[itemIndex].quantity = qty;
  }

  await user.save();
  const updatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: updatedCart
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(
    (item) => item.product.toString() !== productId
  );

  await user.save();
  const updatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: updatedCart
  });
});

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: []
  });
});

// @desc    Sync guest cart with logged-in user cart
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  if (!Array.isArray(cartItems)) {
    res.status(400);
    throw new Error('cartItems must be an array');
  }

  const user = await User.findById(req.user._id);

  for (const item of cartItems) {
    if (!item || !item.productId) continue;
    const pId = item.productId._id || item.productId.id || item.productId;
    const qty = parseInt(item.quantity || 1, 10);

    const product = await Product.findById(pId);
    if (!product || !product.isActive || product.stock <= 0) continue;

    const existingIndex = user.cart.findIndex(
      (cItem) => cItem.product.toString() === pId.toString()
    );

    if (existingIndex > -1) {
      const mergedQty = Math.min(
        user.cart[existingIndex].quantity + qty,
        product.stock
      );
      user.cart[existingIndex].quantity = mergedQty;
    } else {
      const validQty = Math.min(qty, product.stock);
      user.cart.push({ product: pId, quantity: validQty });
    }
  }

  await user.save();
  const updatedCart = await getPopulatedCart(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Cart synced successfully',
    data: updatedCart
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
};
