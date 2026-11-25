const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

/**
 * Initialize Socket.IO with HTTP server and authentication middleware
 * @param {import('http').Server} httpServer
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from auth payload or handshake headers
      let token = socket.handshake.auth?.token;
      if (!token && socket.handshake.headers?.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn(`[Socket.IO Auth] Connection rejected: ${err.message}`);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userRole = socket.user?.role;
    const userName = socket.user?.name || 'User';

    // Only administrators join the admin notification room
    if (userRole === 'admin') {
      socket.join('admin_room');
      console.log(`[Socket.IO] Admin connected: ${userName} (${socket.id}) -> Joined 'admin_room'`);
    } else {
      console.log(`[Socket.IO] Customer connected: ${userName} (${socket.id})`);
    }

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] User disconnected: ${userName} (${socket.id}) - Reason: ${reason}`);
    });
  });

  return io;
}

/**
 * Get the active Socket.IO server instance
 */
function getIO() {
  return io;
}

/**
 * Emit a new order notification to all connected admins in 'admin_room'
 * @param {Object} notificationData
 */
function emitNewOrderNotification(notificationData) {
  if (io) {
    io.to('admin_room').emit('new_order', notificationData);
    console.log(`[Socket.IO] Emitted 'new_order' event to admin_room for Order #${notificationData.orderId}`);
  }
}

/**
 * Emit an update when notifications are read/cleared so all admin screens stay in sync
 * @param {Object} updateData
 */
function emitNotificationStatusUpdate(updateData) {
  if (io) {
    io.to('admin_room').emit('notification_updated', updateData);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitNewOrderNotification,
  emitNotificationStatusUpdate
};
