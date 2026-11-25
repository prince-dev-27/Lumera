import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

export default function Home() {
  const { categories, setSelectedCategory } = useContext(ShopContext);

  // Fetch featured products from the real API
  const { products: featuredProducts, loading: featuredLoading } = useProducts({
    featured: true,
    limit: 4,
    sort: 'newest',
  });

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
  };

  return (
    <div className="space-y-16 pb-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[440px] sm:min-h-[500px] lg:min-h-[580px] lg:h-[75vh] bg-zinc-950 overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop&q=80"
            alt="Luxury jewellery backdrop"
            className="w-full h-full object-cover object-center sm:object-[center_30%] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent sm:from-zinc-950/85 sm:via-zinc-950/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 lg:py-20 flex flex-col justify-center items-start text-left space-y-4 sm:space-y-6">
          <span className="text-luxury-gold uppercase tracking-widest text-xs sm:text-sm font-semibold">Exquisite Craftsmanship</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-white max-w-xl sm:max-w-2xl leading-tight">
            Elegance is not standing out, but being remembered.
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 font-light max-w-sm sm:max-w-md leading-relaxed">
            Discover our meticulously curated line of handcrafted imitation necklaces, earrings, and temple jewelry sets.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            <Link
              to="/shop"
              className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] px-6 sm:px-8 py-3 sm:py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300 text-center shadow-lg"
            >
              Shop Collection
            </Link>
            <Link
              to="/categories"
              className="border border-[#FDFBF7] text-[#FDFBF7] hover:bg-white hover:text-luxury-charcoal px-6 sm:px-8 py-3 sm:py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300 text-center"
            >
              View Collections
            </Link>
          </div>
        </div>
      </section>

      {/* ── Collections grid ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif text-luxury-charcoal">The Collections</h2>
          <div className="h-0.5 w-16 bg-luxury-gold mx-auto" />
          <p className="text-xs text-luxury-gray font-light">
            Explore our handpicked range of fine accessories, plated in 24k gold and rhodium.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to="/shop"
                onClick={() => handleCategoryClick(cat.slug)}
                className="group relative flex flex-col items-center overflow-hidden border border-luxury-border bg-[#FDFBF7] hover:shadow-md transition duration-300"
              >
                <div className="aspect-square w-full overflow-hidden bg-zinc-100">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                      <svg className="w-10 h-10 text-luxury-gold/30" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.36 18.36l.707.707M1 12h1m20 0h1M4.22 19.78l.707-.707M18.36 5.64l.707-.707" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4 text-center">
                  <h3 className="font-serif text-xs sm:text-sm font-semibold text-luxury-charcoal group-hover:text-luxury-gold transition duration-300">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Skeleton while categories load */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-luxury-border">
                <div className="aspect-square bg-zinc-200" />
                <div className="p-4"><div className="h-3 bg-zinc-200 rounded w-2/3 mx-auto" /></div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Promo Banner ─────────────────────────────────────────────────── */}
      <section className="bg-luxury-slate py-10 sm:py-12 border-y border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <span className="text-luxury-gold uppercase tracking-widest text-xs font-semibold">Limited Time Offer</span>
            <h2 className="text-xl sm:text-2xl font-serif text-[#FDFBF7]">
              Enjoy 15% off on your first order. Use code:{' '}
              <span className="text-luxury-gold">WELCOME15</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="bg-[#FDFBF7] text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-charcoal px-6 sm:px-8 py-3 sm:py-3.5 text-xs uppercase tracking-widest font-semibold transition duration-300 shrink-0 w-full sm:w-auto text-center"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif text-luxury-charcoal">Featured Masterpieces</h2>
          <div className="h-0.5 w-16 bg-luxury-gold mx-auto" />
          <p className="text-xs text-luxury-gray font-light">
            Elegantly styled best sellers that reflect premium quality and artistic heritage.
          </p>
        </div>

        {featuredLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-luxury-border">
                <div className="aspect-square bg-zinc-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-zinc-200 rounded w-3/4" />
                  <div className="h-3 bg-zinc-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-luxury-gray py-8">
            No featured products yet.{' '}
            <Link to="/shop" className="text-luxury-gold underline">Browse the full collection.</Link>
          </p>
        )}
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3 p-6 border border-luxury-border/60 bg-[#FDFBF7]">
            <div className="flex justify-center text-luxury-gold">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="font-serif text-sm font-bold text-luxury-charcoal">Antiallergic & Anti-tarnish</h3>
            <p className="text-xs text-luxury-gray font-light leading-relaxed">Nickel-free and lead-free alloys protected by protective anti-tarnish micro-plating.</p>
          </div>

          <div className="text-center space-y-3 p-6 border border-luxury-border/60 bg-[#FDFBF7]">
            <div className="flex justify-center text-luxury-gold">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125a1.125 1.125 0 001.125-1.125V9.75M8.25 18.75h8.25m0 0V8.25m0 10.5a1.5 1.5 0 01-3 0M16.5 8.25h1.5m-3 0H12m3 0L13.5 6h-6L6 8.25" />
              </svg>
            </div>
            <h3 className="font-serif text-sm font-bold text-luxury-charcoal">Insured Premium Delivery</h3>
            <p className="text-xs text-luxury-gray font-light leading-relaxed">Each item is packed securely in shockproof packaging boxes and shipped insured.</p>
          </div>

          <div className="text-center space-y-3 p-6 border border-luxury-border/60 bg-[#FDFBF7]">
            <div className="flex justify-center text-luxury-gold">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <h3 className="font-serif text-sm font-bold text-luxury-charcoal">Hassle-Free Returns</h3>
            <p className="text-xs text-luxury-gray font-light leading-relaxed">Easy replacement or returns if the item does not meet your high standards.</p>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-serif text-luxury-charcoal">Client Appraisals</h2>
          <div className="h-0.5 w-16 bg-luxury-gold mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#FDFBF7] p-8 border border-luxury-border/60 relative italic font-light text-sm text-luxury-charcoal space-y-4">
            <span className="text-6xl text-luxury-gold/20 font-serif absolute -top-4 -left-2">"</span>
            <p className="relative z-10 leading-relaxed">
              "The Imperial Kundan Choker looks even more beautiful in reality. The gold plating is rich and doesn't look artificial at all. I wore it for my brother's wedding and received dozens of compliments."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="h-px w-6 bg-luxury-gold" />
              <span className="text-xs uppercase font-semibold tracking-wider not-italic text-luxury-charcoal">Anjali R., Mumbai</span>
            </div>
          </div>
          <div className="bg-[#FDFBF7] p-8 border border-luxury-border/60 relative italic font-light text-sm text-luxury-charcoal space-y-4">
            <span className="text-6xl text-luxury-gold/20 font-serif absolute -top-4 -left-2">"</span>
            <p className="relative z-10 leading-relaxed">
              "Outstanding service and packing. The solitaire hoop earrings are lightweight and my sensitive skin hasn't reacted. Ideal for regular office wear. Will definitely buy again."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="h-px w-6 bg-luxury-gold" />
              <span className="text-xs uppercase font-semibold tracking-wider not-italic text-luxury-charcoal">Meera S., Bangalore</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
