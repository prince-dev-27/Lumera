import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';

// Loading skeleton card
function SkeletonCard() {
  return (
    <div className="bg-[#FDFBF7] border border-luxury-border animate-pulse">
      <div className="aspect-square bg-zinc-200" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 bg-zinc-200 rounded w-1/3" />
        <div className="h-3 bg-zinc-200 rounded w-3/4" />
        <div className="h-2.5 bg-zinc-200 rounded w-1/4" />
        <div className="h-8 bg-zinc-200 rounded mt-2" />
      </div>
    </div>
  );
}

export default function Shop() {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortOption,
    setSortOption,
    currentPage,
    setCurrentPage,
  } = useContext(ShopContext);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const LIMIT = 12;

  // Fetch products from API
  const { products, loading, error, total, pages } = useProducts({
    search: searchQuery,
    category: selectedCategory,
    maxPrice: priceRange,
    sort: sortOption,
    page: currentPage,
    limit: LIMIT,
  });

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange(5000);
    setSortOption('newest');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCategoryChange = (catSlug) => {
    setSelectedCategory(catSlug);
    setCurrentPage(1);
  };

  const Filters = () => (
    <div className="space-y-8 bg-[#FDFBF7] p-6 border border-luxury-border">
      <div className="flex justify-between items-center pb-4 border-b border-luxury-border">
        <h2 className="text-sm font-serif uppercase tracking-widest font-bold text-luxury-charcoal">Filter Vault</h2>
        <button
          onClick={handleClearFilters}
          className="text-[10px] text-red-600 hover:text-red-800 uppercase tracking-wider font-semibold transition"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-widest text-luxury-gold font-bold">Collections</h3>
        <div className="flex flex-col space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-luxury-charcoal cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'all'}
              onChange={() => handleCategoryChange('all')}
              className="accent-luxury-gold"
            />
            All Jewellery
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2.5 text-xs text-luxury-charcoal cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => handleCategoryChange(cat.slug)}
                className="accent-luxury-gold"
              />
              {cat.name}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-luxury-border">
        <div className="flex justify-between items-center text-xs">
          <h3 className="uppercase tracking-widest text-luxury-gold font-bold">Max Price</h3>
          <span className="font-semibold text-luxury-charcoal">₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={priceRange}
          onChange={(e) => { setPriceRange(Number(e.target.value)); setCurrentPage(1); }}
          className="w-full accent-luxury-gold bg-zinc-200 h-1 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-luxury-gray">
          <span>₹500</span>
          <span>₹5,000</span>
        </div>
      </div>

      {/* Care tip */}
      <div className="bg-luxury-cream border border-luxury-gold/20 p-4 space-y-2">
        <h4 className="text-[10px] uppercase font-bold tracking-widest text-luxury-gold">Luxury Care Tip</h4>
        <p className="text-[10px] text-luxury-gray font-light leading-relaxed">
          Always protect your jewellery plating by spraying perfumes or hairspray before putting on the items. Keep dry.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

      {/* Header */}
      <div className="pb-5 border-b border-luxury-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal">The Jewellery Vault</h1>
          {searchQuery && (
            <p className="text-xs text-luxury-gray mt-1 truncate max-w-xs">
              Results for "<span className="text-luxury-gold font-medium">{searchQuery}</span>"
            </p>
          )}
          {!loading && (
            <p className="text-xs text-luxury-gray mt-0.5">
              {total} product{total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 border border-luxury-border px-3 py-2 text-xs uppercase tracking-wider text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters {filtersOpen ? '▲' : '▼'}
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-xs text-luxury-gray uppercase tracking-widest hidden sm:inline whitespace-nowrap">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-luxury-border text-xs px-3 py-2 text-luxury-charcoal focus:outline-none focus:border-luxury-gold flex-1 sm:flex-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel (collapsible) */}
      {filtersOpen && (
        <div className="lg:hidden mt-4">
          <Filters />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 pt-6">

        {/* ── Sidebar Filters (desktop always visible) */}
        <div className="hidden lg:block space-y-8 lg:sticky lg:top-28 h-fit">
          <Filters />
        </div>

        {/* ── Product Grid */}
        <div className="lg:col-span-3 space-y-6">

          {/* Error state */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 sm:py-20 bg-white border border-luxury-border space-y-4 px-4">
              <div className="flex justify-center text-luxury-gold/50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                </svg>
              </div>
              <h2 className="text-lg font-serif text-luxury-charcoal">No Treasures Found</h2>
              <p className="text-xs text-luxury-gray font-light max-w-sm mx-auto">
                We couldn't find any products matching your selection. Try clearing filters or broadening your search.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 bg-luxury-charcoal text-luxury-gold hover:bg-luxury-gold hover:text-luxury-charcoal px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition duration-300"
              >
                Reset Search
              </button>
            </div>
          )}

          {/* Product grid */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* ── Pagination */}
          {!loading && pages > 1 && (
            <div className="flex items-center justify-center flex-wrap gap-2 pt-4 border-t border-luxury-border">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 sm:px-4 py-2 text-xs border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>

              {[...Array(pages)].map((_, i) => {
                const p = i + 1;
                // Show max 5 page buttons on small screens to avoid overflow
                if (pages > 7 && p !== 1 && p !== pages && Math.abs(p - currentPage) > 2) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 text-xs border transition ${
                      currentPage === p
                        ? 'bg-luxury-gold text-luxury-charcoal border-luxury-gold font-bold'
                        : 'border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= pages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 sm:px-4 py-2 text-xs border border-luxury-border text-luxury-charcoal hover:border-luxury-gold hover:text-luxury-gold disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
