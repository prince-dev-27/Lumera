import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { validateCouponApi } from '../services/api';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    cartLoading,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    clearCart
  } = useContext(ShopContext);

  const [couponCode, setCouponCode] = useState(
    sessionStorage.getItem('lumera_applied_coupon_code') || ''
  );
  const [appliedCoupon, setAppliedCoupon] = useState(
    sessionStorage.getItem('lumera_applied_coupon')
      ? JSON.parse(sessionStorage.getItem('lumera_applied_coupon'))
      : null
  );
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Re-validate applied coupon when cartSubtotal changes (skip if 0 or no coupon)
  useEffect(() => {
    const code = sessionStorage.getItem('lumera_applied_coupon_code');
    if (!code || cartSubtotal <= 0) return;

    validateCouponApi(code, cartSubtotal)
      .then((res) => {
        if (res.success && res.valid) {
          setAppliedCoupon(res.data);
          sessionStorage.setItem('lumera_applied_coupon', JSON.stringify(res.data));
        }
      })
      .catch(() => {
        // If subtotal no longer meets requirement, remove coupon automatically
        setAppliedCoupon(null);
        setCouponCode('');
        sessionStorage.removeItem('lumera_applied_coupon_code');
        sessionStorage.removeItem('lumera_applied_coupon');
        setCouponError('Coupon removed — cart total no longer meets minimum requirement.');
      });
  }, [cartSubtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await validateCouponApi(couponCode, cartSubtotal);
      if (res.success && res.valid) {
        setAppliedCoupon(res.data);
        sessionStorage.setItem('lumera_applied_coupon_code', res.data.code);
        sessionStorage.setItem('lumera_applied_coupon', JSON.stringify(res.data));
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
      sessionStorage.removeItem('lumera_applied_coupon_code');
      sessionStorage.removeItem('lumera_applied_coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    sessionStorage.removeItem('lumera_applied_coupon_code');
    sessionStorage.removeItem('lumera_applied_coupon');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const shippingFee = cartSubtotal >= 2000 ? 0 : cartSubtotal > 0 ? 150 : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  if (cartLoading && cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-luxury-charcoal pb-8 border-b border-luxury-border">
          Your Shopping Bag
        </h1>
        <div className="py-20 text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto" />
          <div className="h-6 bg-zinc-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-zinc-200 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif text-luxury-charcoal pb-8 border-b border-luxury-border">
        Your Shopping Bag
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-20 space-y-6">
          <div className="flex justify-center text-luxury-gold/40">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-luxury-charcoal">Your bag is empty</h2>
          <p className="text-xs text-luxury-gray max-w-sm mx-auto font-light leading-relaxed">
            Browse our unique collections to find perfect imitation necklaces, rings, and earrings to fill your bag.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const product = item.product;
              if (!product) return null;

              const productId = product._id || product.id;
              const price = product.discountPrice || product.price || 0;
              const quantity = item.quantity;
              const image = product.images?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
              const categoryName = typeof product.category === 'object' ? product.category?.name : product.subCategory || '';
              const stock = product.stock !== undefined ? product.stock : 999;
              const isOutOfStock = stock <= 0;
              const isStockCapped = quantity >= stock;

              return (
                <div
                  key={productId}
                  className="flex flex-col pb-6 border-b border-luxury-border gap-4"
                >
                  {/* Image & Title */}
                  <div className="flex items-start gap-4">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 bg-zinc-100 border border-luxury-border overflow-hidden shrink-0 relative" style={{width:'72px',height:'72px'}}>
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center"
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-[9px] text-white uppercase font-bold tracking-tighter">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      {categoryName && (
                        <span className="text-[10px] text-luxury-gold uppercase tracking-widest block font-bold">
                          {categoryName}
                        </span>
                      )}
                      <Link
                        to={`/product/${productId}`}
                        className="text-sm font-serif font-semibold text-luxury-charcoal hover:text-luxury-gold transition duration-300 block truncate"
                      >
                        {product.name}
                      </Link>
                      {product.SKU && (
                        <span className="text-xs text-luxury-gray font-light block">SKU: {product.SKU}</span>
                      )}
                      {isOutOfStock ? (
                        <span className="text-[10px] text-red-600 font-medium block">Currently Unavailable</span>
                      ) : stock <= 5 ? (
                        <span className="text-[10px] text-amber-600 font-medium block">Only {stock} left!</span>
                      ) : null}
                    </div>
                    {/* Remove button top-right on mobile */}
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="p-1 text-zinc-400 hover:text-red-600 transition shrink-0"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between gap-4 pl-1">
                    {/* Quantity controls */}
                    <div className="flex border border-luxury-border">
                      <button
                        onClick={() => updateCartQuantity(productId, quantity - 1)}
                        className="px-2.5 py-1 text-luxury-charcoal hover:bg-zinc-100"
                        title="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 flex items-center justify-center text-xs font-semibold w-9">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(productId, quantity + 1)}
                        disabled={isStockCapped}
                        className={`px-2.5 py-1 text-luxury-charcoal ${
                          isStockCapped ? 'bg-zinc-100 opacity-50 cursor-not-allowed' : 'hover:bg-zinc-100'
                        }`}
                        title={isStockCapped ? 'Stock limit reached' : 'Increase quantity'}
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-sm font-semibold text-luxury-charcoal block">
                        ₹{(price * quantity).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-luxury-gray">₹{price.toLocaleString('en-IN')} each</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart */}
            <div className="flex justify-between items-center pt-2">
              <Link to="/shop" className="text-xs uppercase tracking-widest text-luxury-gold font-bold hover:underline">
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-xs uppercase tracking-widest text-luxury-gray hover:text-red-600 transition font-bold"
              >
                Clear Entire Bag
              </button>
            </div>
          </div>

          {/* Checkout / Order Summary Sidebar */}
          <div className="space-y-6 bg-[#FDFBF7] p-6 border border-luxury-border h-fit">
            <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal pb-4 border-b border-luxury-border">
              Order Summary
            </h2>

            {/* Summary Lines */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-gray">Subtotal</span>
                <span className="font-semibold text-luxury-charcoal">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-red-600">
                  <span className="font-light">
                    Coupon ({appliedCoupon.code})
                  </span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-luxury-gray">Standard Shipping</span>
                <span className="font-semibold text-luxury-charcoal">
                  {shippingFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-luxury-gray leading-normal italic font-light pt-0.5">
                  Free shipping on orders over ₹2,000. Add more items to save!
                </p>
              )}
              <div className="flex justify-between text-sm font-semibold border-t border-luxury-border pt-4 mt-2">
                <span className="text-luxury-charcoal">Total Amount</span>
                <span className="text-luxury-gold text-base font-bold">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupon Code Box */}
            <div className="pt-4 border-t border-luxury-border space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-charcoal">Apply Promo Code</h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 p-2.5 border border-dashed border-emerald-300 text-xs">
                  <div>
                    <span className="text-emerald-800 font-bold block">{appliedCoupon.code} APPLIED</span>
                    <span className="text-[10px] text-emerald-600">Saved ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-[10px] text-red-600 uppercase font-bold hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon Code"
                    className="bg-white border border-luxury-border px-3 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold uppercase w-full"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="bg-luxury-charcoal text-[#FDFBF7] hover:bg-luxury-gold hover:text-luxury-charcoal px-4 py-2 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && <p className="text-[10px] text-red-600 font-medium">{couponError}</p>}
            </div>

            {/* Checkout Button */}
            <div className="pt-4">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white py-3 text-xs uppercase tracking-widest font-semibold transition duration-300"
              >
                Proceed to Checkout
              </button>
              <div className="flex items-center justify-center gap-2 pt-4 text-[10px] text-luxury-gray">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>SSL Secured Checkout Flow</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
