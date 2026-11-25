const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const { emitNotificationStatusUpdate } = require('../config/socket');

/**
 * @desc    Get all notifications with pagination and status filter (Admin only)
 * @route   GET /api/notifications
 * @access  Private (Admin)
 */
const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 15));
  const status = req.query.status; // 'all' | 'unread'

  const query = {};
  if (status === 'unread') {
    query.isRead = false;
  }

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ isRead: false });

  const notifications = await Notification.find(query)
    .populate('orderId', 'orderStatus totalPrice itemsPrice isPaid paymentMethod createdAt shippingAddress')
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    unreadCount,
    data: notifications
  });
});

/**
 * @desc    Get count of unread notifications (Admin only)
 * @route   GET /api/notifications/unread-count
 * @access  Private (Admin)
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    unreadCount
  });
});

/**
 * @desc    Mark single notification as read (Admin only)
 * @route   PUT /api/notifications/:id/read
 * @access  Private (Admin)
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Broadcast status update to all connected admins
    emitNotificationStatusUpdate({
      type: 'single_read',
      id: notification._id
    });
  }

  const unreadCount = await Notification.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    unreadCount,
    data: notification
  });
});

/**
 * @desc    Mark all notifications as read (Admin only)
 * @route   PUT /api/notifications/mark-all-read
 * @access  Private (Admin)
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  // Broadcast status update to all connected admins
  emitNotificationStatusUpdate({
    type: 'mark_all_read'
  });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount,
    unreadCount: 0
  });
});

/**
 * @desc    Delete single notification (Admin only)
 * @route   DELETE /api/notifications/:id
 * @access  Private (Admin)
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await Notification.findByIdAndDelete(req.params.id);

  const unreadCount = await Notification.countDocuments({ isRead: false });

  emitNotificationStatusUpdate({
    type: 'deleted',
    id: req.params.id
  });

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully',
    unreadCount
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
