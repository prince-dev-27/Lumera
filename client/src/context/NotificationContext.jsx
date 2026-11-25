import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi
} from '../services/api';

const NotificationContext = createContext();

/** Play a subtle, elegant luxury chime using Web Audio API */
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First tone (pleasant warm sine)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second harmonic tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.07, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (_e) {
    // Audio autoplay might be blocked before first interaction
  }
}

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeToast, setActiveToast] = useState(null);
  const [latestOrderEvent, setLatestOrderEvent] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const isAdmin = user && user.role === 'admin';

  // ── 1. Fetch unread count & initial list ─────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!isAdmin || !token) return;
    try {
      const res = await getUnreadCountApi();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.warn('Failed to load unread count:', err);
    }
  }, [isAdmin, token]);

  const fetchNotifications = useCallback(
    async ({ page = 1, limit = 15, status = 'all' } = {}) => {
      if (!isAdmin || !token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getNotificationsApi({ page, limit, status });
        if (res && res.success) {
          setNotifications(res.data || []);
          if (typeof res.unreadCount === 'number') {
            setUnreadCount(res.unreadCount);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, token]
  );

  // ── 2. Mark single notification as read ──────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      const res = await markNotificationReadApi(id);
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          )
        );
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        } else {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // ── 3. Mark all notifications as read ────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await markAllNotificationsReadApi();
      if (res && res.success) {
        setNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // ── 4. Delete single notification ────────────────────────────────────────
  const deleteNotification = useCallback(async (id) => {
    try {
      const res = await deleteNotificationApi(id);
      if (res && res.success) {
        setNotifications((prev) => prev.filter((item) => item._id !== id));
        if (typeof res.unreadCount === 'number') {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // ── 5. Toast management ──────────────────────────────────────────────────
  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(null);
  }, []);

  const triggerOrderToast = useCallback(
    (notification) => {
      dismissToast();
      setActiveToast(notification);
      playNotificationChime();

      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 7000);
    },
    [dismissToast]
  );

  // ── 6. Socket.IO Lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Connect to Socket.IO using current origin (proxied via Vite or port 5000 in prod)
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected successfully as Admin');
      setIsConnected(true);
      fetchUnreadCount();
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket.IO Client] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client] Connection error:', err.message);
      setIsConnected(false);
    });

    // Real-Time New Order Event from Server
    socket.on('new_order', (notification) => {
      console.log('[Socket.IO Client] Received new_order notification:', notification);

      // Prepend to notifications list
      setNotifications((prev) => [notification, ...prev]);
      // Increment badge counter
      setUnreadCount((c) => c + 1);
      // Trigger visual toast & chime
      triggerOrderToast(notification);
      // Notify listeners (Dashboard / OrderManagement)
      setLatestOrderEvent(notification);
    });

    // Synchronize across multiple admin sessions when another admin reads/marks all
    socket.on('notification_updated', (update) => {
      if (update.type === 'mark_all_read') {
        setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        setUnreadCount(0);
      } else if (update.type === 'single_read') {
        setNotifications((prev) =>
          prev.map((item) => (item._id === update.id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } else if (update.type === 'deleted') {
        setNotifications((prev) => prev.filter((item) => item._id !== update.id));
        fetchUnreadCount();
      }
    });

    // Initial load
    fetchUnreadCount();
    fetchNotifications({ page: 1, limit: 15 });

    // Fallback polling every 30 seconds for heartbeat & reliability
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAdmin, token, fetchUnreadCount, fetchNotifications, triggerOrderToast]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    activeToast,
    dismissToast,
    latestOrderEvent,
    isConnected,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
