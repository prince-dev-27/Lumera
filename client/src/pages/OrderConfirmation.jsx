import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getOrderByIdApi } from '../services/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await getOrderByIdApi(id);
          if (res.success) {
            setOrder(res.data);
          } else {
            throw new Error(res.message || 'Failed to fetch order details');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold mx-auto" />
        <p className="text-xs uppercase tracking-widest text-luxury-gray font-bold">Loading Order Confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-8 bg-white border border-luxury-border text-center space-y-4">
        <h2 className="text-2xl font-serif text-red-700">Order Information Unavailable</h2>
        <p className="text-xs text-luxury-gray">{error || 'We could not locate this order.'}</p>
        <Link
          to="/shop"
          className="inline-block bg-luxury-gold text-luxury-charcoal px-6 py-2.5 text-xs uppercase tracking-widest font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Confirmation Header Banner */}
      <div className="bg-[#FDFBF7] border border-luxury-border p-8 text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block">
          Order Confirmed & Placed
        </span>
        <h1 className="text-3xl font-serif text-luxury-charcoal">Thank You For Your Purchase</h1>
        <p className="text-xs text-luxury-gray max-w-md mx-auto leading-relaxed">
          We have received your order and are preparing your exquisite jewellery pieces for shipment.
        </p>

        <div className="pt-4 border-t border-luxury-border/60 flex flex-wrap justify-center gap-6 text-xs text-luxury-charcoal font-medium">
          <div>
            <span className="text-[10px] text-luxury-gray uppercase block font-bold">Order Number</span>
            <span className="font-mono text-xs">{order._id}</span>
          </div>
          <div>
            <span className="text-[10px] text-luxury-gray uppercase block font-bold">Order Date</span>
            <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div>
            <span className="text-[10px] text-luxury-gray uppercase block font-bold">Order Status</span>
            <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold uppercase text-[10px] rounded border border-amber-300">
              {order.orderStatus}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-luxury-gray uppercase block font-bold">Payment Method</span>
            <span>{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Shipping Address */}
        <div className="bg-white p-6 border border-luxury-border space-y-3">
          <h3 className="text-xs font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-2 border-b border-luxury-border">
            Shipping Destination
          </h3>
          <div className="text-xs text-luxury-charcoal space-y-1">
            <p className="font-bold text-sm">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
            <p className="text-luxury-gray pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white p-6 border border-luxury-border space-y-3">
          <h3 className="text-xs font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-2 border-b border-luxury-border">
            Payment Breakdown
          </h3>
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-luxury-gray">Items Total</span>
              <span className="font-semibold text-luxury-charcoal">₹{order.itemsPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-luxury-gray">Shipping Fee</span>
              <span className="font-semibold text-luxury-charcoal">
                {order.shippingPrice === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${order.shippingPrice}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-luxury-border pt-3 mt-1">
              <span className="text-luxury-charcoal">Total Amount</span>
              <span className="text-luxury-gold text-base font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-2 text-[10px] text-stone-500 font-light flex items-center justify-between">
              <span>Payment Status: <strong className="uppercase">{order.isPaid ? 'Paid' : 'Pending (COD)'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items Table */}
      <div className="bg-white border border-luxury-border p-6 space-y-4 mb-8">
        <h3 className="text-xs font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-3 border-b border-luxury-border">
          Ordered Items ({order.orderItems?.length || 0})
        </h3>
        <div className="divide-y divide-luxury-border">
          {order.orderItems?.map((item, index) => (
            <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-stone-100 border border-luxury-border overflow-hidden shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=300&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-luxury-charcoal">{item.name}</h4>
                  <span className="text-[11px] text-luxury-gray">₹{item.price.toLocaleString('en-IN')} x {item.quantity}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-luxury-charcoal">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/profile"
          className="w-full sm:w-auto bg-luxury-charcoal text-[#FDFBF7] hover:bg-luxury-gold hover:text-luxury-charcoal px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition text-center"
        >
          View My Orders
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto border border-luxury-border text-luxury-charcoal hover:bg-stone-100 px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
