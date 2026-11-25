import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShopContext } from '../../context/ShopContext';

export default function AddressManagement() {
  const { user, updateProfile } = useAuth();
  const { showToast } = React.useContext(ShopContext);

  const addresses = user?.addresses || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setFormData({
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: addresses.length === 0,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr._id);
    setFormData({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      isDefault: !!addr.isDefault,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.street.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      setError('Please fill in all address fields.');
      return;
    }

    setSaving(true);
    try {
      let updatedAddresses = [...addresses];

      if (editingAddressId) {
        // Edit existing
        updatedAddresses = updatedAddresses.map((addr) => {
          if (addr._id === editingAddressId) {
            return { ...formData, _id: editingAddressId };
          }
          return formData.isDefault ? { ...addr, isDefault: false } : addr;
        });
      } else {
        // Add new
        const newAddressObj = {
          ...formData,
          _id: Date.now().toString(), // temporary ID if not yet saved by Mongoose
        };

        if (formData.isDefault) {
          updatedAddresses = updatedAddresses.map((addr) => ({ ...addr, isDefault: false }));
        }
        updatedAddresses.push(newAddressObj);
      }

      const res = await updateProfile({ addresses: updatedAddresses });
      if (res.success) {
        showToast(
          editingAddressId ? 'Address updated successfully' : 'Address added successfully',
          'success'
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (targetId) => {
    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === targetId,
      }));
      await updateProfile({ addresses: updatedAddresses });
      showToast('Default address updated', 'success');
    } catch (err) {
      showToast('Failed to set default address', 'error');
    }
  };

  const handleDelete = async (targetId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      let updatedAddresses = addresses.filter((addr) => addr._id !== targetId);
      // If deleted address was default and remaining addresses exist, set first as default
      if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }
      await updateProfile({ addresses: updatedAddresses });
      showToast('Address deleted', 'success');
    } catch (err) {
      showToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E4E4E7] gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1A1A]">
            Address Management
          </h2>
          <p className="text-xs text-luxury-gray">
            Save shipping locations for faster, effortless checkout
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#D4AF37] hover:bg-[#bd863e] text-[#1A1A1A] font-semibold text-xs uppercase tracking-widest px-4 py-2.5 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Address</span>
        </button>
      </div>

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E4E4E7] space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-[#1A1A1A]">No Saved Addresses</h3>
          <p className="text-xs text-luxury-gray max-w-sm mx-auto font-light leading-relaxed">
            You have not added any shipping addresses yet. Add your address now for seamless order placement.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-block bg-[#1A1A1A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition"
          >
            Add Shipping Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr, idx) => (
            <div
              key={addr._id || idx}
              className={`bg-white border p-6 flex flex-col justify-between relative space-y-4 ${
                addr.isDefault
                  ? 'border-[#D4AF37] shadow-md ring-1 ring-[#D4AF37]/30'
                  : 'border-[#E4E4E7] hover:border-stone-400'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-serif font-bold text-[#1A1A1A]">
                    {addr.fullName}
                  </h4>
                  {addr.isDefault && (
                    <span className="bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 text-[9px] uppercase tracking-widest font-bold">
                      Default Shipping
                    </span>
                  )}
                </div>
                <p className="text-xs text-luxury-gray font-mono">{addr.phone}</p>
                <div className="mt-3 text-xs text-[#1A1A1A] leading-relaxed space-y-0.5">
                  <p>{addr.street}</p>
                  <p>
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-stone-500">{addr.country || 'India'}</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-3 border-t border-[#E4E4E7] flex items-center justify-between gap-2 text-xs">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[#D4AF37] hover:underline font-medium text-[11px]"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    onClick={() => handleOpenEditModal(addr)}
                    className="text-stone-600 hover:text-[#1A1A1A] font-semibold text-[11px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-red-600 hover:text-red-800 font-semibold text-[11px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FDFBF7] border border-[#E4E4E7] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
              <h3 className="text-lg font-serif font-semibold text-[#1A1A1A]">
                {editingAddressId ? 'Edit Address' : 'Add New Shipping Address'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-[#1A1A1A]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    Recipient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  placeholder="House/Flat No., Street, Landmark"
                  className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Mumbai"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="Maharashtra"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    placeholder="400001"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="India"
                    className="w-full bg-white border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="accent-[#D4AF37] w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-xs text-[#1A1A1A] font-medium cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E4E7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#bd863e] text-[#1A1A1A] px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
