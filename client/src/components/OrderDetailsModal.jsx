import React from 'react';

const STATUS_STEPS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Packed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Shipped':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Out for Delivery':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-luxury-border w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden my-8 animate-fade-in">
        
        {/* Modal Header */}
        <div className="bg-[#1C1917] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-bold block">
              Order Details & Status
            </span>
            <h2 className="text-sm font-mono font-bold text-stone-200">
              #{order._id}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded border ${getStatusBadgeClass(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white text-xl font-bold px-2 py-1"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Progress Bar */}
          {!isCancelled ? (
            <div className="bg-stone-50 p-4 border border-stone-200 rounded-lg">
              <h4 className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-4">
                Fulfillment Timeline
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const isPassed = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                          isCurrent
                            ? 'bg-luxury-gold text-stone-900 ring-2 ring-luxury-gold/50'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] font-bold leading-tight ${
                          isCurrent
                            ? 'text-luxury-gold'
                            : isPassed
                            ? 'text-stone-800'
                            : 'text-stone-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center text-red-800 text-xs font-bold">
              This order was Cancelled.
            </div>
          )}

          {/* Customer & Shipping Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-50 p-4 border border-stone-200 rounded">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                Customer Details
              </span>
              <p className="font-bold text-stone-800">{order.user?.name || order.shippingAddress?.fullName}</p>
              <p className="text-stone-600">{order.user?.email}</p>
              <p className="text-stone-600">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="bg-stone-50 p-4 border border-stone-200 rounded">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                Shipping Destination
              </span>
              <p className="text-stone-800 font-medium">{order.shippingAddress?.street}</p>
              <p className="text-stone-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
              <p className="text-stone-600">{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="text-xs font-serif uppercase tracking-widest font-bold text-luxury-charcoal mb-3">
              Order Items Breakdown
            </h4>
            <div className="border border-stone-200 rounded-lg overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-stone-800 border-collapse">
                <thead>
                  <tr className="bg-stone-100 uppercase text-[10px] text-stone-600 border-b border-stone-200">
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.orderItems?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          className="w-10 h-10 object-cover border border-stone-200 rounded shrink-0"
                        />
                        <div>
                          <span className="font-bold text-stone-900 block">{item.name}</span>
                          {item.product?.SKU && (
                            <span className="text-[10px] text-stone-400 font-mono">SKU: {item.product.SKU}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-stone-600">₹{item.price?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Status History */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            
            {/* Status History Log */}
            <div className="bg-stone-50 p-4 border border-stone-200 rounded space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block">
                Status Event Log
              </span>
              <div className="max-h-28 overflow-y-auto space-y-1.5 text-[11px] pr-1">
                {order.statusHistory?.map((h, i) => (
                  <div key={i} className="flex justify-between border-b border-stone-200/60 pb-1 text-stone-600">
                    <span className="font-semibold text-stone-800">{h.status}</span>
                    <span className="text-stone-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-stone-50 p-4 border border-stone-200 rounded space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800">₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span className="font-semibold">-₹{order.couponDiscount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-stone-800">
                  {order.shippingPrice === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${order.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-2 font-bold text-sm">
                <span className="text-stone-900">Grand Total</span>
                <span className="text-luxury-gold">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[10px] text-stone-500 pt-1">
                Method: <strong>{order.paymentMethod}</strong> ({order.isPaid ? 'Paid' : 'Unpaid'})
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-luxury-charcoal text-white hover:bg-stone-800 px-6 py-2 text-xs uppercase tracking-widest font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
