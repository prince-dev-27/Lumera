import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShopContext } from '../../context/ShopContext';

export default function ProfileDetails() {
  const { user, updateProfile } = useAuth();
  const { showToast } = React.useContext(ShopContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, isEditing]);

  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E4E4E7] gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1A1A]">
            Profile Details
          </h2>
          <p className="text-xs text-luxury-gray">
            Manage your personal account details and contact information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] px-4 py-2 text-xs uppercase tracking-widest font-semibold transition"
          >
            Edit Info
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({ name: user?.name || '', phone: user?.phone || '' });
              setError(null);
            }}
            className="text-xs uppercase tracking-widest text-luxury-gray hover:text-[#1A1A1A] px-3 py-2 font-semibold"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded">
          {error}
        </div>
      )}

      {/* Main Form / Display Card */}
      <div className="bg-white border border-[#E4E4E7] p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  className="w-full bg-[#FDFBF7] border border-[#E4E4E7] px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              ) : (
                <p className="text-sm font-medium text-[#1A1A1A] py-2 border-b border-stone-100">
                  {user?.name || 'N/A'}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block mb-1.5">
                Email Address <span className="text-stone-400 font-normal">(Primary)</span>
              </label>
              <p className="text-sm font-medium text-[#1A1A1A] py-2 border-b border-stone-100 truncate">
                {user?.email || 'N/A'}
              </p>
              <span className="text-[10px] text-stone-400 block mt-1">
                Email address cannot be changed for security purposes.
              </span>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block mb-1.5">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FDFBF7] border border-[#E4E4E7] px-4 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
                />
              ) : (
                <p className="text-sm font-medium text-[#1A1A1A] py-2 border-b border-stone-100">
                  {user?.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Account Role */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block mb-1.5">
                Account Type & Role
              </label>
              <p className="text-sm font-medium text-[#1A1A1A] py-2 border-b border-stone-100 capitalize">
                {user?.role || 'Customer'}
              </p>
            </div>
          </div>

          {/* Form Action Buttons when editing */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E4E4E7]">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user?.name || '', phone: user?.phone || '' });
                }}
                className="px-5 py-2.5 text-xs uppercase tracking-widest font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#D4AF37] hover:bg-[#bd863e] text-[#1A1A1A] px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FDFBF7] border border-[#E4E4E7] p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">
            Verification Status
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-800">
              {user?.isVerified ? 'Verified Account' : 'Active Account'}
            </span>
          </div>
        </div>

        <div className="bg-[#FDFBF7] border border-[#E4E4E7] p-5 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gray font-bold block">
            Registration Date
          </span>
          <span className="text-xs font-semibold text-[#1A1A1A]">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) : 'Recent'}
          </span>
        </div>
      </div>
    </div>
  );
}
