import React, { useState, useEffect, useCallback } from 'react';
import {
  getCouponsApi,
  createCouponApi,
  updateCouponApi,
  toggleCouponApi,
  deleteCouponApi
} from '../../services/api';
import Pagination from './Pagination';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCouponsApi();
      if (res.success) {
        setCoupons(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountAmount: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountAmount: coupon.discountAmount.toString(),
      minOrderAmount: (coupon.minOrderAmount || 0).toString(),
      maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount.toString() : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const res = await toggleCouponApi(couponId);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c._id === couponId ? { ...c, isActive: res.data.isActive } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    try {
      const res = await deleteCouponApi(couponId);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Please enter a coupon code.');
      return;
    }

    if (!formData.discountAmount || Number(formData.discountAmount) <= 0) {
      setFormError('Please enter a valid discount amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountAmount: Number(formData.discountAmount),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        expiryDate: formData.expiryDate ? formData.expiryDate : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: formData.isActive
      };

      if (editingCoupon) {
        await updateCouponApi(editingCoupon._id, payload);
      } else {
        await createCouponApi(payload);
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      setFormError(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Pagination Math
  const totalItems = filteredCoupons.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = filteredCoupons.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-luxury-charcoal">Coupon Code Management</h2>
          <p className="text-xs text-stone-500">Create, edit, activate/deactivate promo codes and discount rules</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto bg-luxury-gold text-stone-900 px-5 py-2.5 text-xs uppercase tracking-wider font-bold rounded-lg hover:bg-[#bd863e] hover:text-white transition shrink-0"
        >
          + Create Coupon
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 border border-luxury-border rounded-xl shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-luxury-border pl-9 pr-8 py-2 text-xs rounded-lg focus:outline-none focus:border-luxury-gold bg-stone-50 focus:bg-white transition-all font-mono uppercase"
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

        <span className="text-xs text-stone-500 font-medium self-end sm:self-center">
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">{error}</div>
      )}

      {/* Coupon List Table */}
      {loading ? (
        <div className="flex justify-center py-16 bg-white border border-luxury-border rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
          {/* Desktop Table View (md and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
              <thead>
                <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                  <th className="py-3.5 px-4 font-bold">Coupon Code</th>
                  <th className="py-3.5 px-4 font-bold">Discount</th>
                  <th className="py-3.5 px-4 font-bold">Min Order</th>
                  <th className="py-3.5 px-4 font-bold">Expiry Date</th>
                  <th className="py-3.5 px-4 font-bold">Usage Count</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentCoupons.map((c) => {
                  const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();

                  return (
                    <tr key={c._id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-luxury-gold tracking-wider text-sm">
                        {c.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        {c.discountType === 'percentage'
                          ? `${c.discountAmount}% OFF ${c.maxDiscountAmount ? `(Up to ₹${c.maxDiscountAmount})` : ''}`
                          : `₹${c.discountAmount} OFF`}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-600">
                        ₹{c.minOrderAmount ? c.minOrderAmount.toLocaleString('en-IN') : 0}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.expiryDate ? (
                          <span className={isExpired ? 'text-red-600 font-bold' : 'text-stone-600'}>
                            {new Date(c.expiryDate).toLocaleDateString('en-IN')}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">No Expiry</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 font-medium">
                        {c.usedCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(c._id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition ${
                            c.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="text-stone-700 hover:text-luxury-gold font-bold text-xs hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c._id, c.code)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="md:hidden divide-y divide-stone-100">
            {currentCoupons.map((c) => {
              const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();

              return (
                <div key={c._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-base text-luxury-gold tracking-wider block">
                        {c.code}
                      </span>
                      <p className="font-semibold text-xs text-stone-900 mt-0.5">
                        {c.discountType === 'percentage'
                          ? `${c.discountAmount}% OFF ${c.maxDiscountAmount ? `(Up to ₹${c.maxDiscountAmount})` : ''}`
                          : `₹${c.discountAmount} OFF`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(c._id)}
                      className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider border shrink-0 ${
                        c.isActive
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-stone-100 text-stone-600 border-stone-300'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Min Order</span>
                      <span className="text-stone-700 font-semibold">
                        ₹{c.minOrderAmount ? c.minOrderAmount.toLocaleString('en-IN') : 0}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Expiry Date</span>
                      <span className={isExpired ? 'text-red-600 font-bold' : 'text-stone-700 font-medium'}>
                        {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'No Expiry'}
                        {isExpired && ' (Expired)'}
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-stone-200/50 flex justify-between text-[11px] text-stone-500">
                      <span>Usage: {c.usedCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => handleOpenEditModal(c)}
                      className="px-3 py-1.5 text-xs font-bold text-luxury-charcoal border border-luxury-border rounded-lg hover:border-luxury-gold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(c._id, c.code)}
                      className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCoupons.length === 0 && !loading && (
            <div className="py-12 text-center text-xs text-stone-500">
              No coupon codes found. Click "+ Create Coupon" to add one.
            </div>
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

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-luxury-border w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-stone-200">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-luxury-charcoal uppercase tracking-wider">
                {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-base p-1 rounded-lg hover:bg-stone-100 transition"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold uppercase font-mono font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder={formData.discountType === 'percentage' ? '20' : '150'}
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Minimum Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Max Cap (₹, Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-600 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full border border-stone-300 px-3 py-2 rounded-lg focus:outline-none focus:border-luxury-gold text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-luxury-gold accent-luxury-gold rounded"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Activate Coupon immediately
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-1/2 border border-stone-300 text-stone-700 font-bold py-2.5 rounded-lg hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-1/2 bg-luxury-gold text-stone-900 font-bold py-2.5 uppercase tracking-wider text-[11px] rounded-lg hover:bg-[#bd863e] hover:text-white transition shadow-xs"
                >
                  {submitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
