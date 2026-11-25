import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell({ onSelectOrder }) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isConnected
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications({ page: 1, limit: 20 });
    }
    setIsOpen((prev) => !prev);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    setViewAllModalOpen(false);

    const orderId =
      notif.orderId?._id ||
      (typeof notif.orderId === 'string' ? notif.orderId : null);

    if (orderId && onSelectOrder) {
      onSelectOrder(orderId);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Notification Bell Trigger Button ── */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-luxury-gold/50"
        title="Admin Notifications"
        aria-label="Admin Notifications"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Red Badge with Pulse animation */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Socket connection indicator dot */}
        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${
            isConnected ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
          title={isConnected ? 'Live Socket: Connected' : 'Live Socket: Reconnecting'}
        />
      </button>

      {/* ── Dropdown Popover ── */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-md bg-white border border-luxury-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[560px] animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-stone-900">
                Order Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-luxury-gold hover:text-amber-700 transition"
                  title="Mark all notifications as read"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs (All / Unread) */}
          <div className="flex items-center border-b border-stone-100 bg-white px-3 py-1.5 text-xs shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 font-semibold rounded-md transition ${
                filter === 'all'
                  ? 'bg-amber-50 text-luxury-gold border border-luxury-gold/30'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`ml-1.5 px-3 py-1 font-semibold rounded-md transition ${
                filter === 'unread'
                  ? 'bg-amber-50 text-luxury-gold border border-luxury-gold/30'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-stone-100 custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400 gap-2">
                <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-xs text-red-600 space-y-2">
                <p>Failed to load notifications.</p>
                <button
                  onClick={() => fetchNotifications()}
                  className="text-luxury-gold font-bold underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-stone-700">No notifications found</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {filter === 'unread'
                    ? 'All customer order notifications have been read.'
                    : 'Customer orders will appear here automatically.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const orderId =
                  notif.orderId?._id ||
                  (typeof notif.orderId === 'string' ? notif.orderId : null);
                const orderNumber =
                  notif.orderData?.orderNumber ||
                  (orderId ? orderId.toString().slice(-8).toUpperCase() : 'N/A');
                const customerName =
                  notif.orderData?.customerName ||
                  notif.customerId?.name ||
                  notif.orderId?.shippingAddress?.fullName ||
                  'Customer';
                const totalAmount =
                  notif.orderData?.totalAmount ??
                  notif.orderId?.totalPrice ??
                  0;
                const formattedDate = formatTimestamp(notif.createdAt);

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 ${
                      notif.isRead ? 'bg-white hover:bg-stone-50' : 'bg-amber-50/50 hover:bg-amber-100/50'
                    }`}
                  >
                    {/* Unread indicator dot & icon */}
                    <div className="pt-0.5 shrink-0 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          notif.isRead
                            ? 'bg-stone-100 text-stone-500'
                            : 'bg-amber-200 text-amber-900 border border-amber-300'
                        }`}
                      >
                        🛍️
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 animate-pulse" />
                      )}
                    </div>

                    {/* Notification content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider">
                          Order #{orderNumber}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {formattedDate}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                        {customerName}
                      </p>

                      <p className="text-[11px] text-stone-600 line-clamp-1">
                        {notif.message || 'New order received!'}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 pt-1 text-xs">
                        <span className="font-bold text-stone-900 font-mono text-[11px]">
                          ₹{Number(totalAmount).toLocaleString('en-IN')}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notif._id);
                              }}
                              className="text-[10px] font-semibold text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition"
                              title="Mark this notification as read"
                            >
                              Mark read
                            </button>
                          )}
                          <span className="text-[10px] font-bold text-luxury-gold group-hover:translate-x-0.5 transition-transform">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                setViewAllModalOpen(true);
              }}
              className="text-stone-600 hover:text-stone-900 font-semibold"
            >
              View all notifications ({notifications.length})
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── View All Notifications Modal ── */}
      {viewAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-luxury-border shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  All Order Notifications
                </h3>
                <p className="text-xs text-stone-500">History of incoming orders</p>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-luxury-gold hover:text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200 transition"
                  >
                    Mark All As Read
                  </button>
                )}
                <button
                  onClick={() => setViewAllModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal List */}
            <div className="p-4 overflow-y-auto divide-y divide-stone-100 flex-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`py-3 px-3 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition ${
                      notif.isRead ? 'hover:bg-stone-50' : 'bg-amber-50/70 hover:bg-amber-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          notif.isRead ? 'bg-stone-100' : 'bg-amber-200 border border-amber-300'
                        }`}
                      >
                        🛍️
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-xs">
                            {notif.orderData?.customerName || notif.customerId?.name || 'Customer'}
                          </span>
                          <span className="font-mono text-[10px] text-luxury-gold font-bold">
                            #{notif.orderData?.orderNumber || notif.orderId?._id?.toString().slice(-8)}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">{notif.message}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-stone-900 text-xs font-mono">
                        ₹{(notif.orderData?.totalAmount ?? notif.orderId?.totalPrice ?? 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {formatTimestamp(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setViewAllModalOpen(false)}
                className="px-5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
