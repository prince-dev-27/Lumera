import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

export default function OrderToast({ onSelectOrder }) {
  const { activeToast, dismissToast } = useNotifications();

  if (!activeToast) return null;

  const orderId = activeToast.orderId?._id || activeToast.orderId || activeToast.order?._id;
  const customerName =
    activeToast.orderData?.customerName ||
    activeToast.customerId?.name ||
    activeToast.order?.shippingAddress?.fullName ||
    'Customer';
  const totalAmount =
    activeToast.orderData?.totalAmount ??
    activeToast.order?.totalPrice ??
    0;
  const orderNumber =
    activeToast.orderData?.orderNumber ||
    (orderId ? orderId.toString().slice(-8).toUpperCase() : '');
  const itemCount = activeToast.orderData?.itemCount || activeToast.order?.orderItems?.length || 1;

  const handleView = () => {
    if (orderId && onSelectOrder) {
      onSelectOrder(orderId);
    }
    dismissToast();
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-slide-in">
      <div className="bg-white/95 backdrop-blur-md border-2 border-luxury-gold shadow-2xl rounded-2xl overflow-hidden p-4 relative text-luxury-charcoal transform transition-all duration-300 hover:scale-[1.02]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-luxury-gold to-amber-600 animate-pulse" />

        <div className="flex items-start gap-3.5 pt-1">
          {/* Bell / Jewel icon with pulse ring */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-luxury-gold border border-luxury-gold/40 shadow-xs">
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold">
                Live Order Alert
              </span>
              <button
                onClick={dismissToast}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-0.5 leading-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>

            <h4 className="font-serif font-bold text-sm text-stone-900 truncate mt-0.5">
              New Order Received!
            </h4>

            <p className="text-xs text-stone-600 mt-1">
              <span className="font-semibold text-stone-900">{customerName}</span> placed order{' '}
              <span className="font-mono font-bold text-luxury-gold">#{orderNumber}</span>
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-xs">
              <span className="font-bold text-stone-900 text-sm">
                ₹{Number(totalAmount).toLocaleString('en-IN')}
                <span className="text-[11px] font-normal text-stone-500 ml-1">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              </span>

              <button
                onClick={handleView}
                className="px-3 py-1 bg-luxury-gold hover:bg-amber-600 text-stone-950 hover:text-white text-xs font-bold rounded-md shadow-xs transition-all flex items-center gap-1"
              >
                <span>View Order</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
