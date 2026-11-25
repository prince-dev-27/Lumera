import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({
  activeTab,
  setActiveTab,
  children,
  searchKeyword,
  setSearchKeyword,
  onSelectOrder
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex text-luxury-charcoal">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Header */}
        <AdminHeader
          activeTab={activeTab}
          onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleDesktopSidebar={() => setSidebarCollapsed((prev) => !prev)}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
          onSelectOrder={onSelectOrder}
        />

        {/* Content Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

