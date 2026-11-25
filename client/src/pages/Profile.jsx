import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountOverview from '../components/account/AccountOverview';
import ProfileDetails from '../components/account/ProfileDetails';
import AddressManagement from '../components/account/AddressManagement';
import OrderHistoryTab from '../components/account/OrderHistoryTab';
import WishlistTab from '../components/account/WishlistTab';
import AccountSettings from '../components/account/AccountSettings';

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get active tab from URL query param, default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  // Close or reset if unauthenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'details',
      label: 'Profile Details',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'details':
        return <ProfileDetails />;
      case 'addresses':
        return <AddressManagement />;
      case 'orders':
        return <OrderHistoryTab />;
      case 'wishlist':
        return <WishlistTab />;
      case 'settings':
        return <AccountSettings />;
      case 'overview':
      default:
        return <AccountOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Mobile / Tablet Horizontal Navigation Tabs */}
      <div className="lg:hidden mb-6 border-b border-[#E4E4E7] overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition border ${
              activeTab === tab.id
                ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]'
                : 'bg-white text-luxury-gray border-[#E4E4E7] hover:border-[#D4AF37]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block lg:col-span-1 bg-white border border-[#E4E4E7] p-5 space-y-6 shadow-xs sticky top-24">
          {/* User Mini Profile Badge */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#E4E4E7]">
            <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#D4AF37] font-serif text-sm font-bold flex items-center justify-center border border-[#D4AF37] shrink-0">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-serif font-bold text-[#1A1A1A] truncate">
                {user.name}
              </h3>
              <p className="text-[11px] text-luxury-gray truncate font-light">
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Navigation Menu */}
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs uppercase tracking-wider font-semibold transition rounded-none text-left ${
                  activeTab === tab.id
                    ? 'bg-[#1A1A1A] text-[#D4AF37] border-l-4 border-[#D4AF37]'
                    : 'text-luxury-gray hover:bg-[#FDFBF7] hover:text-[#1A1A1A]'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#D4AF37]' : 'text-stone-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}

            {isAdmin && (
              <>
                <div className="my-2 border-t border-[#E4E4E7]" />
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-xs uppercase tracking-wider font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition text-left"
                >
                  <svg className="w-4 h-4 text-amber-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </nav>

          {/* Logout Action */}
          <div className="pt-4 border-t border-[#E4E4E7]">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 transition border border-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="lg:col-span-3">
          {renderActiveTabContent()}
        </div>
      </div>
    </div>
  );
}
