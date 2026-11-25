import React from 'react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Customers',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#1C1917] text-stone-300 flex flex-col transition-all duration-300 ease-in-out border-r border-stone-800 overflow-x-hidden ${
          collapsed ? 'md:w-20' : 'md:w-64'
        } w-64 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Header */}
        <div
          className={`h-[64px] border-b border-stone-800 flex items-center shrink-0 transition-all ${
            collapsed && !mobileOpen ? 'px-2 justify-center gap-1' : 'px-4 justify-between'
          }`}
        >
          <div
            onClick={collapsed && !mobileOpen ? () => setCollapsed(false) : undefined}
            className={`flex items-center gap-2.5 overflow-hidden ${
              collapsed && !mobileOpen ? 'cursor-pointer hover:opacity-90 transition' : ''
            }`}
            title={collapsed && !mobileOpen ? 'Click to expand sidebar' : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-luxury-gold flex items-center justify-center shadow-md font-serif text-stone-950 font-bold text-base shrink-0">
              L
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base font-bold tracking-wider text-luxury-gold truncate">
                  LUMERA
                </span>
                <span className="text-[8px] text-amber-300/80 uppercase tracking-widest font-bold font-mono leading-none">
                  ADMIN PORTAL
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-stone-400 hover:text-white p-1.5 rounded-md hover:bg-stone-800 transition"
            aria-label="Close Mobile Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex text-stone-400 hover:text-white p-1.5 rounded-md hover:bg-stone-800 transition items-center justify-center shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Section */}
        <nav
          className={`flex-1 py-4 px-2.5 space-y-1.5 overflow-x-hidden ${
            collapsed && !mobileOpen
              ? 'overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
              : 'overflow-y-auto custom-scrollbar'
          }`}
        >
          {(!collapsed || mobileOpen) && (
            <p className="px-3 text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-3">
              Management Menu
            </p>
          )}

          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false); // Closes drawer on mobile after navigation
                }}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all group relative ${
                  active
                    ? 'bg-luxury-gold text-stone-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
              >
                <div className={`${active ? 'text-stone-950' : 'text-amber-400/80 group-hover:text-amber-300'}`}>
                  {item.icon}
                </div>
                {(!collapsed || mobileOpen) && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {collapsed && !mobileOpen && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-stone-900 text-stone-100 text-[11px] font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-stone-700">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-stone-800 text-[10px] text-stone-400 text-center shrink-0">
          {collapsed && !mobileOpen ? (
            <span className="font-mono text-amber-400 font-bold text-[11px]">v1.0</span>
          ) : (
            <div className="space-y-0.5">
              <p className="font-semibold text-stone-400">Lumera Control Panel</p>
              <p className="text-stone-400 text-[9px]">v1.0 • Admin Portal</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


