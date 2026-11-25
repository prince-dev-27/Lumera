import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShopContext } from '../../context/ShopContext';

export default function AccountSettings() {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = React.useContext(ShopContext);
  const navigate = useNavigate();

  // Password state
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    securityAlerts: true,
  });

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    setPassError(null);

    if (!passData.currentPassword || !passData.newPassword || !passData.confirmPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await updateProfile({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      showToast('Password changed successfully!', 'success');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleToggleNotify = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      showToast('Notification preference updated', 'success');
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    showToast('Logged out of session', 'success');
    navigate('/login');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-4 border-b border-[#E4E4E7]">
        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1A1A]">
          Account Settings
        </h2>
        <p className="text-xs text-luxury-gray">
          Manage password security, communications, and account preferences
        </p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white border border-[#E4E4E7] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-serif font-semibold text-[#1A1A1A]">
              Security & Password
            </h3>
            <p className="text-xs text-luxury-gray">
              Update your password regularly to keep your account safe
            </p>
          </div>
        </div>

        {passError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {passError}
          </div>
        )}

        <form onSubmit={handlePassSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passData.currentPassword}
              onChange={handlePassChange}
              required
              placeholder="••••••••"
              className="w-full bg-[#FDFBF7] border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={passData.newPassword}
                onChange={handlePassChange}
                required
                placeholder="Min. 6 characters"
                className="w-full bg-[#FDFBF7] border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-luxury-gray block mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passData.confirmPassword}
                onChange={handlePassChange}
                required
                placeholder="Repeat new password"
                className="w-full bg-[#FDFBF7] border border-[#E4E4E7] p-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="bg-[#1A1A1A] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#1A1A1A] px-6 py-2.5 text-xs uppercase tracking-widest font-semibold transition disabled:opacity-50"
          >
            {passLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences Card */}
      <div className="bg-white border border-[#E4E4E7] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-serif font-semibold text-[#1A1A1A]">
              Notification Preferences
            </h3>
            <p className="text-xs text-luxury-gray">
              Choose what notifications and updates you receive
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-xl text-xs">
          <div className="flex items-center justify-between p-3 bg-[#FDFBF7] border border-[#E4E4E7]">
            <div>
              <p className="font-semibold text-[#1A1A1A]">Order Status & Shipping Updates</p>
              <p className="text-stone-500 text-[11px]">Receive updates regarding your purchases and deliveries</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleToggleNotify('orderUpdates')}
              className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FDFBF7] border border-[#E4E4E7]">
            <div>
              <p className="font-semibold text-[#1A1A1A]">Promotions & Exclusive Vault Releases</p>
              <p className="text-stone-500 text-[11px]">Receive special discounts, coupons, and collection news</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={() => handleToggleNotify('promotions')}
              className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FDFBF7] border border-[#E4E4E7]">
            <div>
              <p className="font-semibold text-[#1A1A1A]">Security Alerts</p>
              <p className="text-stone-500 text-[11px]">Get notified about login activity or password changes</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.securityAlerts}
              onChange={() => handleToggleNotify('securityAlerts')}
              className="accent-[#D4AF37] w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Session & Logout Danger Zone */}
      <div className="bg-red-50/50 border border-red-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs uppercase font-bold text-red-900 tracking-wider">
            Sign Out of Account
          </h4>
          <p className="text-xs text-red-700 mt-0.5">
            Log out of your current session on this device
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-700 hover:bg-red-800 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
