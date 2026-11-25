const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { emitNewOrderNotification } = require('../config/socket');

const ALLOWED_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod = 'Cash on Delivery', couponCode } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
    res.status(400);
    throw new Error('Please provide complete shipping address information');
  }

  // Validate items, check stock, and calculate totals using server database prices ONLY
  const verifiedOrderItems = [];
  let calculatedItemsPrice = 0;

  for (const item of orderItems) {
    const productId = item.product || item._id;
    const requestedQty = parseInt(item.quantity, 10);

    if (!productId || isNaN(requestedQty) || requestedQty <= 0) {
      res.status(400);
      throw new Error(`Invalid item quantity or product ID in request`);
    }

    const dbProduct = await Product.findById(productId);

    if (!dbProduct || !dbProduct.isActive) {
      res.status(404);
      throw new Error(`Product unavailable or no longer active`);
    }

    // Validate stock before creating order
    if (dbProduct.stock < requestedQty) {
      res.status(400);
      throw new Error(
        `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stock} unit(s) available in inventory.`
      );
    }

    // Determine unit price from DB (do NOT trust client price!)
    const unitPrice =
      dbProduct.discountPrice !== null &&
      dbProduct.discountPrice !== undefined &&
      dbProduct.discountPrice < dbProduct.price
        ? dbProduct.discountPrice
        : dbProduct.price;

    calculatedItemsPrice += unitPrice * requestedQty;

    verifiedOrderItems.push({
      product: dbProduct._id,
      name: dbProduct.name,
      quantity: requestedQty,
      price: unitPrice,
      image: dbProduct.images && dbProduct.images.length > 0 ? dbProduct.images[0] : ''
    });
  }

  // Server-side calculated shipping & tax
  const calculatedShippingPrice = calculatedItemsPrice >= 2000 ? 0 : 150;
  const calculatedTaxPrice = 0;

  // Process optional coupon
  let appliedCouponCode = '';
  let calculatedCouponDiscount = 0;
  let targetCoupon = null;

  if (couponCode && couponCode.trim()) {
    const cleanCode = couponCode.trim().toUpperCase();
    targetCoupon = await Coupon.findOne({ code: cleanCode });

    if (!targetCoupon || !targetCoupon.isActive) {
      res.status(400);
      throw new Error(`Invalid or inactive coupon code "${cleanCode}"`);
    }

    if (targetCoupon.expiryDate && new Date(targetCoupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error(`Coupon code "${cleanCode}" has expired`);
    }

    if (calculatedItemsPrice < targetCoupon.minOrderAmount) {
      res.status(400);
      throw new Error(
        `Minimum order amount of ₹${targetCoupon.minOrderAmount} required for coupon "${cleanCode}"`
      );
    }

    if (targetCoupon.usageLimit !== null && targetCoupon.usedCount >= targetCoupon.usageLimit) {
      res.status(400);
      throw new Error(`Usage limit reached for coupon "${cleanCode}"`);
    }

    if (targetCoupon.discountType === 'percentage') {
      calculatedCouponDiscount = (calculatedItemsPrice * targetCoupon.discountAmount) / 100;
      if (targetCoupon.maxDiscountAmount && calculatedCouponDiscount > targetCoupon.maxDiscountAmount) {
        calculatedCouponDiscount = targetCoupon.maxDiscountAmount;
      }
    } else if (targetCoupon.discountType === 'fixed') {
      calculatedCouponDiscount = Math.min(targetCoupon.discountAmount, calculatedItemsPrice);
    }

    calculatedCouponDiscount = Math.round(calculatedCouponDiscount * 100) / 100;
    appliedCouponCode = targetCoupon.code;
  }

  const calculatedTotalPrice = Math.max(
    0,
    calculatedItemsPrice + calculatedShippingPrice + calculatedTaxPrice - calculatedCouponDiscount
  );

  // Create Order document
  const order = new Order({
    user: req.user._id,
    orderItems: verifiedOrderItems,
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || 'India'
    },
    paymentMethod,
    itemsPrice: calculatedItemsPrice,
    shippingPrice: calculatedShippingPrice,
    taxPrice: calculatedTaxPrice,
    couponCode: appliedCouponCode,
    couponDiscount: calculatedCouponDiscount,
    totalPrice: calculatedTotalPrice,
    orderStatus: 'Pending',
    statusHistory: [
      {
        status: 'Pending',
        timestamp: new Date()
      }
    ]
  });

  const createdOrder = await order.save();

  // Increment coupon usage count if coupon applied
  if (targetCoupon) {
    await Coupon.findByIdAndUpdate(targetCoupon._id, {
      $inc: { usedCount: 1 }
    });
  }

  // Reduce product stock in database after successful order creation
  for (const item of verifiedOrderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  // Clear customer's server cart after successful order creation
  await User.findByIdAndUpdate(req.user._id, {
    $set: { cart: [] }
  });

  // Create order notification for admin and emit real-time event
  try {
    const existingNotification = await Notification.findOne({
      orderId: createdOrder._id,
      type: 'new_order'
    });

    if (!existingNotification) {
      const customerName = shippingAddress.fullName || req.user.name || 'Customer';
      const customerEmail = req.user.email || '';
      const orderNumber = createdOrder._id.toString().slice(-8).toUpperCase();

      const notification = await Notification.create({
        type: 'new_order',
        orderId: createdOrder._id,
        customerId: req.user._id,
        orderData: {
          orderNumber,
          customerName,
          customerEmail,
          totalAmount: createdOrder.totalPrice,
          itemCount: verifiedOrderItems.reduce((acc, it) => acc + it.quantity, 0),
          paymentMethod: createdOrder.paymentMethod
        },
        message: `New order #${orderNumber} received from ${customerName}!`,
        isRead: false
      });

      // Emit real-time notification to active admin users
      emitNewOrderNotification({
        _id: notification._id,
        type: notification.type,
        orderId: createdOrder._id,
        customerId: {
          _id: req.user._id,
          name: customerName,
          email: customerEmail
        },
        orderData: notification.orderData,
        message: notification.message,
        isRead: false,
        createdAt: notification.createdAt,
        order: {
          _id: createdOrder._id,
          totalPrice: createdOrder.totalPrice,
          orderStatus: createdOrder.orderStatus,
          isPaid: createdOrder.isPaid,
          paymentMethod: createdOrder.paymentMethod,
          createdAt: createdOrder.createdAt,
          shippingAddress: createdOrder.shippingAddress,
          orderItems: createdOrder.orderItems,
          user: {
            _id: req.user._id,
            name: customerName,
            email: customerEmail
          }
        }
      });
    }
  } catch (notifErr) {
    console.error('[Notification] Failed to create order notification:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: createdOrder
  });
});

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private (Customer)
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('orderItems.product', 'name images category price discountPrice')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images category price discountPrice SKU');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // User can only view their own order unless they are an admin
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Admin)
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};

  if (status && status !== 'all' && ALLOWED_STATUSES.includes(status)) {
    filter.orderStatus = status;
  }

  let orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images price')
    .sort({ createdAt: -1 });

  if (search && search.trim() !== '') {
    const term = search.trim().toLowerCase();
    orders = orders.filter((order) => {
      const matchId = order._id.toString().toLowerCase().includes(term);
      const matchName = order.user?.name?.toLowerCase().includes(term);
      const matchEmail = order.user?.email?.toLowerCase().includes(term);
      const matchRecipient = order.shippingAddress?.fullName?.toLowerCase().includes(term);
      return matchId || matchName || matchEmail || matchRecipient;
    });
  }

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Admin)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid order status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const previousStatus = order.orderStatus;

  // Restock inventory if order is being cancelled from a non-cancelled state
  if (previousStatus !== 'Cancelled' && status === 'Cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
  }

  // If order was cancelled and is now reactivated, check & deduct stock
  if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
  }

  order.orderStatus = status;

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'Cash on Delivery') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  order.statusHistory.push({
    status,
    timestamp: new Date()
  });

  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updatedOrder
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
