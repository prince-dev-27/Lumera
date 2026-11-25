import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import LumeraLoader from '../components/LumeraLoader';
import {
  getProductById,
  getProducts,
  getProductReviewsApi,
  checkReviewEligibilityApi,
  createReviewApi
} from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart, wishlist, toggleWishlist, showToast } = useContext(ShopContext);
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [eligibility, setEligibility] = useState({ canReview: false, hasReviewed: false, review: null });
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadReviews = useCallback(async (productId) => {
    setReviewsLoading(true);
    try {
      const res = await getProductReviewsApi(productId);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Failed loading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const loadEligibility = useCallback(async (productId) => {
    if (!isAuthenticated) {
      setEligibility({ canReview: false, hasReviewed: false, review: null });
      return;
    }
    try {
      const res = await checkReviewEligibilityApi(productId);
      if (res.success && res.data) {
        setEligibility(res.data);
        if (res.data.review) {
          setRatingInput(res.data.review.rating);
          setCommentInput(res.data.review.comment);
        }
      }
    } catch (err) {
      console.error('Failed checking review eligibility:', err);
    }
  }, [isAuthenticated]);

  // Fetch product from API
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);
      setRelatedProducts([]);
      setQuantity(1);
      setActiveTab('details');
      try {
        const data = await getProductById(id);
        if (cancelled) return;
        const p = data.data;
        setProduct(p);
        setActiveImage(p.images?.[0] || '');

        // Load reviews & eligibility
        loadReviews(p._id);
        loadEligibility(p._id);

        // Fetch related products (same category, exclude self)
        if (p.category?._id || p.category) {
          const catId = p.category?._id || p.category;
          const rel = await getProducts({ category: catId, limit: 4 });
          if (!cancelled) {
            setRelatedProducts(
              rel.data.filter((r) => r._id !== p._id).slice(0, 3)
            );
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id, loadReviews, loadEligibility]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (!commentInput.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await createReviewApi(product._id, {
        rating: ratingInput,
        comment: commentInput
      });

      if (res.success) {
        if (showToast) showToast('Review submitted successfully!', 'success');
        // Reload reviews & product data to update average rating
        await loadReviews(product._id);
        await loadEligibility(product._id);
        const updatedP = await getProductById(product._id);
        setProduct(updatedP.data);
      } else {
        throw new Error(res.message || 'Failed to submit review');
      }
    } catch (err) {
      setReviewError(err.message || 'Review submission failed');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return <LumeraLoader text="Opening jewellery piece..." fullScreen={false} />;
  }

  // ── Error / not found state ────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-serif text-luxury-charcoal">Treasury Item Not Found</h2>
        <p className="text-xs text-luxury-gray">
          {error || 'The item you are searching for might be discontinued or renamed.'}
        </p>
        <Link
          to="/shop"
          className="inline-block bg-luxury-gold text-luxury-charcoal px-6 py-2.5 text-xs uppercase tracking-widest font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const productId = product._id;
  const isWishlisted = wishlist.some((item) => (item._id || item.id) === productId);
  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  // Flatten attributes for Specifications tab
  const attrs = product.attributes || {};
  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? product.category.name
      : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* ── Product Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-zinc-100 overflow-hidden border border-luxury-border">
            <img
              src={activeImage || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border bg-zinc-100 ${
                    activeImage === img
                      ? 'border-luxury-gold ring-1 ring-luxury-gold'
                      : 'border-luxury-border'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-luxury-gold uppercase tracking-widest font-bold">{categoryName}</span>
            <h1 className="text-3xl sm:text-4xl font-serif text-luxury-charcoal">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'fill-current text-amber-500' : 'text-zinc-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-luxury-gray font-medium">
              {product.rating ? `${product.rating} / 5` : 'New'} ({product.numReviews || reviews.length} customer reviews)
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 pt-2">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-semibold text-luxury-charcoal">
                ₹{product.discountPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-luxury-gray line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 border border-red-200">
                Save ₹{(product.price - product.discountPrice).toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold text-luxury-charcoal">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <p className="text-xs text-luxury-gray font-light leading-relaxed">{product.description}</p>

        {/* Status */}
        <div className="space-y-1.5 text-xs text-luxury-charcoal pt-4 border-t border-luxury-border">
          <div>
            <span className="text-luxury-gray">Availability: </span>
            {isOutOfStock ? (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-orange-600 font-semibold">Low Stock (Only {product.stock} left)</span>
            ) : (
              <span className="text-green-600 font-semibold">In Stock</span>
            )}
          </div>
          <div>
            <span className="text-luxury-gray">SKU: </span>
            <span className="font-mono">{product.slug || product._id}</span>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="space-y-3 pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex border border-luxury-border bg-white">
              <button
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity((q) => q - 1)}
                className="px-3 sm:px-4 py-2.5 text-luxury-charcoal hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                -
              </button>
              <span className="px-4 py-2.5 flex items-center justify-center text-xs font-semibold w-10">
                {quantity}
              </span>
              <button
                disabled={quantity >= (product.stock ?? 99) || isOutOfStock}
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 sm:px-4 py-2.5 text-luxury-charcoal hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                +
              </button>
            </div>

            <button
              disabled={isOutOfStock}
              onClick={() => addToCart(product, quantity)}
              className={`flex-1 min-w-[140px] py-3 text-xs uppercase tracking-widest font-semibold transition duration-300 ${
                isOutOfStock
                  ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                  : 'bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className="p-3 border border-luxury-border hover:border-red-500 hover:text-red-500 transition duration-300"
              aria-label="Toggle Wishlist"
            >
              <svg
                className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-luxury-charcoal'}`}
                fill={isWishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* ── Tabs ──────────────────────────────────────────────────────────── */}
    <div className="border border-luxury-border bg-[#FDFBF7]">
      <div className="flex overflow-x-auto border-b border-luxury-border text-xs uppercase tracking-wider font-semibold">
        {['details', 'specifications', 'care', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-none px-4 sm:px-6 py-3 sm:py-4 border-r border-luxury-border transition last:border-r-0 whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-luxury-gold border-b-2 border-b-luxury-gold'
                : 'text-luxury-gray hover:text-luxury-charcoal'
            }`}
          >
            {tab === 'care'
              ? 'Care'
              : tab === 'reviews'
              ? `Reviews (${reviews.length})`
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-6 text-xs text-luxury-charcoal leading-relaxed space-y-4">
        {activeTab === 'details' && (
          <p className="font-light">{product.description}</p>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6">
            {attrs.material && (
              <div>
                <span className="text-luxury-gray font-light block">Material</span>
                <span className="font-medium">{attrs.material}</span>
              </div>
            )}
            {attrs.plating && (
              <div>
                <span className="text-luxury-gray font-light block">Plating</span>
                <span className="font-medium">{attrs.plating}</span>
              </div>
            )}
            {attrs.stoneType && (
              <div>
                <span className="text-luxury-gray font-light block">Stones</span>
                <span className="font-medium">{attrs.stoneType}</span>
              </div>
            )}
            {attrs.size && (
              <div>
                <span className="text-luxury-gray font-light block">Size</span>
                <span className="font-medium">{attrs.size}</span>
              </div>
            )}
            {!attrs.material && !attrs.plating && !attrs.stoneType && !attrs.size && (
              <p className="text-luxury-gray col-span-3">No specifications available.</p>
            )}
          </div>
        )}

        {activeTab === 'care' && (
          <p className="italic text-luxury-gray leading-relaxed font-light">
            Store in a cool, dry place away from moisture and direct sunlight. Avoid contact with perfume, water, and harsh chemicals. Wipe gently with a soft dry cloth after use.
          </p>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Reviews Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-luxury-border gap-4">
              <div>
                <h3 className="font-serif text-base font-bold text-luxury-charcoal">Customer Reviews & Ratings</h3>
                <p className="text-[11px] text-luxury-gray">Feedback from verified purchasers</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-serif font-bold text-luxury-charcoal">
                  {product.rating ? product.rating.toFixed(1) : '0.0'}
                </span>
                <div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'fill-current text-amber-500' : 'text-zinc-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] text-luxury-gray block pt-0.5">{reviews.length} total rating(s)</span>
                </div>
              </div>
            </div>

            {/* Write Review Section */}
            <div className="bg-white p-6 border border-luxury-border space-y-4">
              <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-luxury-charcoal">
                {eligibility.hasReviewed ? 'Edit Your Review' : 'Write a Customer Review'}
              </h4>

              {!isAuthenticated ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span>Please log in to your account to leave a review for purchased items.</span>
                  <Link to={`/login?redirect=product/${product._id}`} className="font-bold underline uppercase tracking-wider">
                    Log In
                  </Link>
                </div>
              ) : !eligibility.canReview ? (
                <div className="p-4 bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs rounded flex items-center gap-2">
                  <svg className="w-5 h-5 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Only customers who have purchased this product are eligible to leave a review.</span>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star rating selector */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                      Your Rating (1 to 5 Stars) *
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="p-1 focus:outline-none transition"
                        >
                          <svg
                            className={`w-6 h-6 ${star <= ratingInput ? 'fill-current text-amber-500' : 'text-zinc-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gray font-bold mb-1">
                      Your Review *
                    </label>
                    <textarea
                      rows="3"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Describe your experience with this jewellery piece, quality, packaging, and design..."
                      className="w-full bg-[#FDFBF7] border border-luxury-border p-3 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold"
                      required
                    />
                  </div>

                  {reviewError && <p className="text-xs text-red-600 font-semibold">{reviewError}</p>}

                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-luxury-gold text-luxury-charcoal hover:bg-[#bd863e] hover:text-white px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : eligibility.hasReviewed ? 'Update Review' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              <h4 className="font-serif text-sm font-bold text-luxury-charcoal">All Customer Reviews</h4>
              
              {reviewsLoading ? (
                <div className="py-8 text-center text-xs text-luxury-gray">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-luxury-gray bg-white border border-luxury-border">
                  No reviews yet for this masterpiece. Be the first verified customer to leave a review!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-white border border-luxury-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-luxury-charcoal">{rev.user?.name || 'Verified Customer'}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Verified Buyer
                          </span>
                        </div>
                        <span className="text-[10px] text-luxury-gray">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN') : ''}
                        </span>
                      </div>

                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current text-amber-500' : 'text-zinc-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      <p className="text-xs text-luxury-charcoal font-light leading-relaxed pt-1">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

      {/* ── Related Products ───────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-serif text-luxury-charcoal">Related Masterpieces</h2>
            <div className="h-0.5 w-16 bg-luxury-gold mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
