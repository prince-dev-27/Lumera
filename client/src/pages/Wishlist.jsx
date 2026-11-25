import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';

export default function Wishlist() {
  const { wishlist, wishlistLoading, moveToCart } = useContext(ShopContext);

  if (wishlistLoading && wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-luxury-charcoal pb-8 border-b border-luxury-border">
          Your Treasury Wishlist
        </h1>
        <div className="py-20 text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-zinc-200 rounded-full mx-auto" />
          <div className="h-6 bg-zinc-200 rounded w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif text-luxury-charcoal pb-8 border-b border-luxury-border">
        Your Treasury Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 space-y-6">
          <div className="flex justify-center text-luxury-gold/40">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif text-luxury-charcoal">Your wishlist is empty</h2>
          <p className="text-xs text-luxury-gray max-w-sm mx-auto font-light leading-relaxed">
            Save items you love here. Tap the heart icon on any jewelry masterpiece while browsing our vault.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
          >
            Explore Masterpieces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 pt-8">
          {wishlist.map((product) => {
            if (!product) return null;
            const productId = product._id || product.id;
            const isOutOfStock = product.stock !== undefined && product.stock <= 0;

            return (
              <div key={productId} className="relative flex flex-col justify-between group">
                <ProductCard product={product} />
                
                {/* Move to Cart Quick Action */}
                <button
                  disabled={isOutOfStock}
                  onClick={() => moveToCart(product, 1)}
                  className={`mt-2 w-full py-2.5 text-xs uppercase tracking-widest font-semibold text-center transition ${
                    isOutOfStock
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-luxury-charcoal text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
