import React, { useState, useEffect, useCallback } from 'react';
import { getAllReviewsApi, approveReviewApi, deleteReviewApi } from '../../services/api';
import Pagination from './Pagination';
import CustomDropdown from '../CustomDropdown';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllReviewsApi();
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load customer reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleToggleApproval = async (reviewId, currentStatus) => {
    try {
      const res = await approveReviewApi(reviewId, !currentStatus);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, isApproved: res.data.isApproved } : r))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review permanently?')) return;
    try {
      const res = await deleteReviewApi(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const term = search.trim().toLowerCase();
    const matchProduct = r.product?.name?.toLowerCase().includes(term);
    const matchUser = r.user?.name?.toLowerCase().includes(term) || r.user?.email?.toLowerCase().includes(term);
    const matchComment = r.comment?.toLowerCase().includes(term);
    const matchSearch = !term || matchProduct || matchUser || matchComment;

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && r.isApproved) ||
      (statusFilter === 'hidden' && !r.isApproved);

    return matchSearch && matchStatus;
  });

  // Pagination Math
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">Customer Reviews Moderation</h2>
          <p className="text-xs text-stone-500">View customer ratings, approve/unapprove, and remove reviews</p>
        </div>
        <button
          onClick={loadReviews}
          className="w-full sm:w-auto text-xs text-luxury-gold border border-luxury-gold px-4 py-2 rounded-lg font-bold uppercase hover:bg-amber-50 transition shrink-0 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Reviews
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow">
          {/* Search Box */}
          <div className="relative flex-grow max-w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search product, customer, comment..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-stone-50 border border-luxury-border rounded-lg pl-9 pr-8 py-2 text-xs text-luxury-charcoal focus:outline-none focus:border-luxury-gold focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-56">
            <CustomDropdown
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Moderation Statuses' },
                { value: 'approved', label: 'Approved Only' },
                { value: 'hidden', label: 'Hidden Only' },
              ]}
            />
          </div>
        </div>

        <span className="text-xs text-stone-500 font-medium self-end sm:self-center">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">{error}</div>
      )}

      {/* Reviews List Table */}
      {loading ? (
        <div className="flex justify-center py-16 bg-white border border-luxury-border rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
          {/* Desktop Table View (lg and up) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
              <thead>
                <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                  <th className="py-3.5 px-4 font-bold">Product</th>
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Rating</th>
                  <th className="py-3.5 px-4 font-bold">Review Comment</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentReviews.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 max-w-xs">
                        <div className="w-10 h-10 bg-stone-100 border border-stone-200 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={r.product?.images?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1'}
                            alt={r.product?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-bold text-luxury-charcoal truncate">{r.product?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-800">{r.user?.name || 'Customer'}</div>
                      <div className="text-[10px] text-stone-500">{r.user?.email || ''}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= r.rating ? 'fill-current text-amber-500' : 'text-zinc-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-stone-700 leading-relaxed font-light line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-medium">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border ${
                        r.isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleApproval(r._id, r.isApproved)}
                          className="text-stone-700 hover:text-luxury-gold font-bold text-xs hover:underline"
                        >
                          {r.isApproved ? 'Unapprove' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="text-red-500 hover:text-red-700 font-bold text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< lg) */}
          <div className="lg:hidden divide-y divide-stone-100">
            {currentReviews.map((r) => (
              <div key={r._id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start gap-3">
                  <img
                    src={r.product?.images?.[0] || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1'}
                    alt={r.product?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-stone-900 truncate">{r.product?.name || 'N/A'}</h4>
                      <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full border shrink-0 ${
                        r.isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {r.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= r.rating ? 'fill-current text-amber-500' : 'text-zinc-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-semibold">• {r.user?.name || 'Customer'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-xs text-stone-700 italic">
                  "{r.comment}"
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                  <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : ''}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleApproval(r._id, r.isApproved)}
                      className="px-3 py-1 text-xs font-bold text-stone-800 border border-stone-200 rounded-lg hover:border-luxury-gold transition"
                    >
                      {r.isApproved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      className="px-3 py-1 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-stone-500">No customer reviews found.</div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      )}
    </div>
  );
}
