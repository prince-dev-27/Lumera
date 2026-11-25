import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart } = useContext(ShopContext);

  const productId = product._id || product.id;
  const isWishlisted = wishlist.some((item) => (item._id || item.id) === productId);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Support both API shape (isFeatured) and mock shape (featured/newArrival)
  const isNew = product.isFeatured || product.newArrival;
  // Category name: could be a populated object or a plain string
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : product.subCategory || '';

  return (
    <div className="group relative bg-[#FDFBF7] flex flex-col justify-between overflow-hidden border border-luxury-border hover:border-luxury-gold/30 hover:shadow-lg transition duration-500">

      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <Link to={`/product/${productId}`}>
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition duration-700"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>

        {/* Wishlist Button Overlay */}
        <button
          onClick={() => toggleWishlist(product)}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white text-luxury-charcoal hover:text-red-500 rounded-full shadow transition duration-300"
          aria-label="Toggle Wishlist"
        >
          <svg
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-luxury-charcoal'}`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isOutOfStock && (
            <span className="bg-zinc-800 text-[#FDFBF7] text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
              Sold Out
            </span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className="bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5">
              -{discountPercent}% OFF
            </span>
          )}
          {isNew && !isOutOfStock && (
            <span className="bg-luxury-gold text-luxury-charcoal text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
              New
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category / Subcategory label */}
          <span className="text-[10px] text-luxury-gray uppercase tracking-widest block">{categoryName}</span>

          {/* Name */}
          <Link
            to={`/product/${productId}`}
            className="text-sm font-serif font-semibold text-luxury-charcoal hover:text-luxury-gold line-clamp-1 transition duration-300"
          >
            {product.name}
          </Link>

          {/* Rating — only shown when available */}
          {product.rating != null && (
            <div className="flex items-center space-x-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-zinc-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-luxury-gray">({product.rating})</span>
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-luxury-border/50">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount ? (
              <>
                <span className="text-sm font-semibold text-luxury-charcoal">
                  ₹{product.discountPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-luxury-gray line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-luxury-charcoal">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`p-2 transition duration-300 rounded ${
              isOutOfStock
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                : 'bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white'
            }`}
            aria-label="Add to Cart"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
