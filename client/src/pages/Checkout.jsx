import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { createOrderApi } from '../services/api';

export default function Checkout() {
  const { cart, cartSubtotal, showToast, clearCart } = useContext(ShopContext);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const [appliedCoupon] = useState(
    sessionStorage.getItem('lumera_applied_coupon')
      ? JSON.parse(sessionStorage.getItem('lumera_applied_coupon'))
      : null
  );

  const couponDiscount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const shippingFee = cartSubtotal >= 2000 ? 0 : cartSubtotal > 0 ? 150 : 0;
  const totalPrice = Math.max(0, cartSubtotal + shippingFee - couponDiscount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      showToast('Please log in to complete your checkout.', 'error');
      navigate('/login?redirect=checkout');
      return;
    }

    if (cart.length === 0) {
      showToast('Your shopping bag is empty.', 'error');
      return;
    }

    // Basic address validation
    if (
      !shippingAddress.fullName.trim() ||
      !shippingAddress.phone.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.city.trim() ||
      !shippingAddress.state.trim() ||
      !shippingAddress.postalCode.trim()
    ) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    // Prepare items format for server
    const orderItems = cart.map((item) => ({
      product: item.product._id || item.product.id,
      quantity: item.quantity
    }));

    setLoading(true);

    try {
      const res = await createOrderApi({
        orderItems,
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      if (res.success && res.data) {
        showToast('Order placed successfully!', 'success');
        // Clear applied coupon from session storage
        sessionStorage.removeItem('lumera_applied_coupon_code');
        sessionStorage.removeItem('lumera_applied_coupon');
        // Clear cart in frontend state
        await clearCart();
        // Navigate to Order Confirmation page with order data
        navigate(`/order-confirmation/${res.data._id}`, {
          state: { order: res.data }
        });
      } else {
        throw new Error(res.message || 'Failed to place order.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'An error occurred while placing your order.');
      showToast(err.message || 'Order placement failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto my-16 px-6 py-12 text-center bg-white border border-luxury-border">
        <h2 className="text-2xl font-serif text-luxury-charcoal mb-4">Customer Authentication Required</h2>
        <p className="text-xs text-luxury-gray mb-6">
          Please log in or register to complete your order checkout.
        </p>
        <Link
          to="/login?redirect=checkout"
          className="inline-block bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
        >
          Log In to Continue
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto my-16 px-6 py-12 text-center bg-white border border-luxury-border space-y-4">
        <h2 className="text-2xl font-serif text-luxury-charcoal">Your Bag is Empty</h2>
        <p className="text-xs text-luxury-gray">
          There are no items in your bag to checkout.
        </p>
        <Link
          to="/shop"
          className="inline-block bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="border-b border-luxury-border pb-6 mb-8 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block mb-1">
            Secure Checkout
          </span>
          <h1 className="text-3xl font-serif text-luxury-charcoal">Delivery & Payment Details</h1>
        </div>
        <Link to="/cart" className="text-xs text-luxury-gray hover:text-luxury-gold uppercase tracking-widest font-semibold">
          ← Return to Bag
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Shipping Address & Shipping Info */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Shipping Address */}
          <div className="bg-[#FDFBF7] p-6 border border-luxury-border space-y-6">
            <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-3 border-b border-luxury-border flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-charcoal text-xs flex items-center justify-center font-sans">1</span>
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Ananya Sharma"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  Postal Code / PIN *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="400001"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  Street Address & House No. *
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Flat 402, Building A, MG Road"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Mumbai"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Maharashtra"
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white border border-luxury-border px-3 py-2.5 text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Method */}
          <div className="bg-[#FDFBF7] p-6 border border-luxury-border space-y-4">
            <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-3 border-b border-luxury-border flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-charcoal text-xs flex items-center justify-center font-sans">2</span>
              Shipping Information
            </h2>
            <div className="p-4 bg-white border border-luxury-gold/50 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="font-bold text-luxury-charcoal block">Standard Insured Courier</span>
                <span className="text-[11px] text-luxury-gray block">Delivered safely within 3 - 5 business days with tamper-evident packaging.</span>
              </div>
              <span className="font-bold text-luxury-gold">
                {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
              </span>
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-[#FDFBF7] p-6 border border-luxury-border space-y-4">
            <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-3 border-b border-luxury-border flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-luxury-gold text-luxury-charcoal text-xs flex items-center justify-center font-sans">3</span>
              Payment Method
            </h2>

            <div className="space-y-3">
              {/* Cash on Delivery option */}
              <label className="flex items-center justify-between p-4 bg-white border-2 border-luxury-gold cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-luxury-gold w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-luxury-charcoal block">Cash on Delivery (COD)</span>
                    <span className="text-[11px] text-luxury-gray block">Pay with cash upon delivery at your doorstep.</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 uppercase tracking-wider rounded">
                  Available
                </span>
              </label>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FDFBF7] p-5 sm:p-6 border border-luxury-border lg:sticky lg:top-6 space-y-6">
            <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-4 border-b border-luxury-border">
              Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)} Items)
            </h2>

            {/* Items Breakdown */}
            <div className="max-h-72 overflow-y-auto space-y-4 pr-1 divide-y divide-luxury-border/50">
              {cart.map((item) => {
                const p = item.product;
                if (!p) return null;
                const price = p.discountPrice || p.price || 0;
                const img = p.images?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=300&auto=format&fit=crop&q=80';

                return (
                  <div key={p._id || p.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white border border-luxury-border overflow-hidden shrink-0 relative">
                        <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-luxury-charcoal text-white text-[9px] px-1 font-mono font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-semibold text-luxury-charcoal line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] text-luxury-gray">₹{price.toLocaleString('en-IN')} each</span>
                      </div>
                    </div>
                    <span className="font-semibold text-luxury-charcoal shrink-0">
                      ₹{(price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals Calculation */}
            <div className="border-t border-luxury-border pt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-gray">Items Subtotal</span>
                <span className="font-semibold text-luxury-charcoal">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-red-600">
                  <span className="font-light">Coupon ({appliedCoupon.code})</span>
                  <span className="font-semibold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-luxury-gray">Shipping Fee</span>
                <span className="font-semibold text-luxury-charcoal">
                  {shippingFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-luxury-border pt-4 mt-2">
                <span className="text-luxury-charcoal">Total Payable</span>
                <span className="text-luxury-gold text-base font-bold">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-xs uppercase tracking-widest font-semibold transition duration-300 ${
                loading
                  ? 'bg-zinc-400 text-white cursor-not-allowed'
                  : 'bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white shadow-md'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-stone-900" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                `Place Order • ₹${totalPrice.toLocaleString('en-IN')}`
              )}
            </button>

            <p className="text-[10px] text-center text-luxury-gray font-light">
              By placing your order, you agree to Lumera’s terms of service and shipping policies.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
