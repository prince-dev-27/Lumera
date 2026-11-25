import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShopContext } from '../context/ShopContext';

export default function NavbarProfileDropdown() {
  const { user, isAdmin, logout } = useAuth();
  const { wishlist, showToast } = React.useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Account';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="User Account Menu"
        className="flex items-center gap-2 py-1.5 px-2.5 rounded-full border border-[#E4E4E7] bg-white/80 hover:bg-white hover:border-[#D4AF37] transition duration-300 group focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
      >
        <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#D4AF37] font-semibold text-xs flex items-center justify-center border border-[#D4AF37]/60 group-hover:scale-105 transition-transform shrink-0">
          {getInitials(user?.name)}
        </div>
        <span className="text-xs font-medium text-[#1A1A1A] group-hover:text-[#D4AF37] transition max-w-[90px] truncate hidden sm:inline-block">
          {firstName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-luxury-gray group-hover:text-[#D4AF37] transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#D4AF37]' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-[#FDFBF7] border border-[#E4E4E7] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header Section */}
          <div className="p-4 bg-[#1A1A1A] text-[#FDFBF7] border-b border-[#D4AF37]/30 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#2A2A2A] text-[#D4AF37] font-serif font-bold text-sm flex items-center justify-center border-2 border-[#D4AF37] shrink-0 shadow-inner">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-serif font-medium text-[#FDFBF7] truncate">
                {user?.name || 'Customer'}
              </h4>
              <p className="text-[11px] text-stone-400 truncate font-light">
                {user?.email}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                    isAdmin
                      ? 'bg-amber-900/80 text-amber-200 border border-amber-600/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                  }`}
                >
                  {user?.role || 'Customer'}
                </span>
                {user?.isVerified && (
                  <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-2 text-xs">
            <Link
              to="/profile?tab=overview"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium"
            >
              <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Account Overview</span>
            </Link>

            <Link
              to="/profile?tab=details"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium"
            >
              <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile Details</span>
            </Link>

            <Link
              to="/profile?tab=addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium"
            >
              <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Address Management</span>
            </Link>

            <Link
              to="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Order History</span>
              </div>
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium justify-between"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
              </div>
              {wishlist.length > 0 && (
                <span className="bg-[#D4AF37] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/profile?tab=settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[#1A1A1A] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition font-medium"
            >
              <svg className="w-4 h-4 text-luxury-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Account Settings</span>
            </Link>

            {isAdmin && (
              <>
                <div className="my-1 border-t border-[#E4E4E7]" />
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-amber-900 bg-amber-50 hover:bg-amber-100 transition font-semibold"
                >
                  <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Control Panel</span>
                </Link>
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 border-t border-[#E4E4E7] bg-[#FDFBF7]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 hover:text-red-900 transition border border-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
