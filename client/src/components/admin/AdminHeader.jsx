import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function AdminHeader({
  activeTab,
  onToggleMobileSidebar,
  sidebarCollapsed,
  onToggleDesktopSidebar,
  searchKeyword,
  setSearchKeyword,
  onSelectOrder
}) {
  const { user, logout } = useAuth();

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    products: 'Product Catalogue & Management',
    categories: 'Category Management',
    inventory: 'Inventory & Stock Control',
    orders: 'Order Management & Fulfillment',
    coupons: 'Coupons & Discount Codes',
    reviews: 'Customer Reviews Moderation',
    users: 'Customer Accounts & Roles',
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-luxury-border sticky top-0 z-30 px-3 sm:px-6 lg:px-8 h-[64px] shadow-xs flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition shrink-0"
          aria-label="Open Navigation Drawer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleDesktopSidebar}
          className="hidden md:flex p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition shrink-0"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Desktop Sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h12M4 18h16" />
          </svg>
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block leading-none">
              Lumera Admin
            </span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="System Status: Active" />
          </div>
          <h1 className="text-base sm:text-lg lg:text-xl font-serif text-luxury-charcoal font-bold truncate leading-tight">
            {tabTitles[activeTab] || 'Admin Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right side user info & quick actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Search */}
        <div className="hidden lg:flex items-center relative">
          <input
            type="text"
            placeholder="Search catalogue or orders..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="pl-9 pr-8 py-1.5 text-xs border border-luxury-border rounded-full focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/50 bg-stone-50/80 w-56 xl:w-64 transition-all"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Storefront Link */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-luxury-gold px-2.5 py-1.5 rounded-md border border-stone-200 hover:border-luxury-gold/50 transition bg-stone-50/50"
          title="Visit Public Storefront"
        >
          <span>Storefront</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        {/* Admin Notification Bell */}
        <NotificationBell onSelectOrder={onSelectOrder} />

        {/* User profile dropdown info */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-luxury-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-luxury-gold/40 text-amber-950 font-serif font-bold text-xs flex items-center justify-center border border-luxury-gold/50 shadow-xs shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden sm:block text-left max-w-[120px]">
            <span className="text-xs font-bold text-luxury-charcoal block leading-tight truncate">
              {user?.name || 'Administrator'}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block leading-none">
              {user?.role || 'admin'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs font-semibold text-stone-600 hover:text-red-600 transition px-2.5 py-1.5 border border-stone-200 hover:border-red-200 hover:bg-red-50/50 rounded-md shrink-0"
            title="Logout of admin panel"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

