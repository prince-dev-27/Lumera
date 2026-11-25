const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'new_order',
      enum: ['new_order', 'order_status', 'inventory_alert', 'general']
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderData: {
      orderNumber: { type: String },
      customerName: { type: String, default: 'Customer' },
      customerEmail: { type: String, default: '' },
      totalAmount: { type: Number, default: 0 },
      itemCount: { type: Number, default: 1 },
      paymentMethod: { type: String, default: 'Cash on Delivery' }
    },
    message: {
      type: String,
      required: true,
      default: 'New order received!'
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index to ensure efficient querying of unread notifications and prevent duplicate notifications for an order
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ orderId: 1, type: 1 }, { unique: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
