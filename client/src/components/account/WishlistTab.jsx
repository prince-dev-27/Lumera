import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../context/ShopContext';
import ProductCard from '../ProductCard';

export default function WishlistTab() {
  const { wishlist, wishlistLoading, moveToCart, removeFromWishlist } = useContext(ShopContext);

  if (wishlistLoading && wishlist.length === 0) {
    return (
      <div className="space-y-6 animate-pulse py-12 text-center">
        <div className="w-12 h-12 bg-stone-200 rounded-full mx-auto" />
        <div className="h-4 bg-stone-200 rounded w-48 mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E4E4E7] gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1A1A]">
            Treasury Wishlist
          </h2>
          <p className="text-xs text-luxury-gray">
            Your saved fine jewelry collection ({wishlist.length} item{wishlist.length !== 1 ? 's' : ''})
          </p>
        </div>
        {wishlist.length > 0 && (
          <Link
            to="/shop"
            className="text-xs uppercase tracking-widest text-[#D4AF37] hover:underline font-semibold"
          >
            Explore More Masterpieces &rarr;
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E4E4E7] space-y-4">
          <div className="flex justify-center text-[#D4AF37]/40">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-[#1A1A1A]">Your Wishlist is Empty</h3>
          <p className="text-xs text-luxury-gray max-w-sm mx-auto font-light leading-relaxed">
            Save items you love here. Tap the heart icon on any jewelry piece while browsing our collection.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
          >
            Explore Masterpieces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => {
            if (!product) return null;
            const productId = product._id || product.id;
            const isOutOfStock = product.stock !== undefined && product.stock <= 0;

            return (
              <div key={productId} className="relative flex flex-col justify-between group bg-white border border-[#E4E4E7] p-4">
                <ProductCard product={product} />

                <div className="mt-3 flex items-center gap-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => moveToCart(product, 1)}
                    className={`flex-1 py-2.5 text-[11px] uppercase tracking-widest font-semibold text-center transition ${
                      isOutOfStock
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-[#1A1A1A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(productId)}
                    className="p-2 text-stone-400 hover:text-red-600 transition border border-[#E4E4E7] hover:border-red-200"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
