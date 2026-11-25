import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShopContext } from '../../context/ShopContext';
import { getMyOrdersApi } from '../../services/api';

export default function AccountOverview({ setActiveTab }) {
  const { user, isAdmin } = useAuth();
  const { wishlist } = React.useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function loadRecentOrders() {
      try {
        const res = await getMyOrdersApi();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load recent orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadRecentOrders();
  }, []);

  const savedAddressesCount = user?.addresses?.length || 0;
  const recentOrders = orders.slice(0, 2);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-[#1A1A1A] text-[#FDFBF7] p-6 sm:p-8 border border-[#D4AF37]/30 shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#2A2A2A] text-[#D4AF37] font-serif text-xl font-bold flex items-center justify-center border-2 border-[#D4AF37] shrink-0 shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'LM'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  Customer Vault
                </span>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${
                  isAdmin
                    ? 'bg-amber-900/60 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50'
                }`}>
                  {user?.role || 'Customer'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#FDFBF7] font-normal mt-0.5">
                Welcome back, {user?.name || 'Valued Customer'}
              </h2>
              <p className="text-xs text-stone-400 font-light mt-1">
                {user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('details')}
            className="bg-[#D4AF37] hover:bg-[#bd863e] text-[#1A1A1A] font-semibold text-xs uppercase tracking-widest px-5 py-2.5 transition shadow-sm self-stretch sm:self-auto text-center"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Orders Card */}
        <button
          onClick={() => setActiveTab('orders')}
          className="bg-white p-5 border border-[#E4E4E7] hover:border-[#D4AF37] transition text-left group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#1A1A1A]">
            {loadingOrders ? '...' : orders.length}
          </div>
          <p className="text-xs text-luxury-gray mt-1 group-hover:text-[#D4AF37] transition flex items-center gap-1 font-medium">
            <span>View order history</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </button>

        {/* Addresses Card */}
        <button
          onClick={() => setActiveTab('addresses')}
          className="bg-white p-5 border border-[#E4E4E7] hover:border-[#D4AF37] transition text-left group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
              Saved Addresses
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D4AF37] flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#1A1A1A]">
            {savedAddressesCount}
          </div>
          <p className="text-xs text-luxury-gray mt-1 group-hover:text-[#D4AF37] transition flex items-center gap-1 font-medium">
            <span>Manage shipping addresses</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </button>

        {/* Wishlist Card */}
        <button
          onClick={() => setActiveTab('wishlist')}
          className="bg-white p-5 border border-[#E4E4E7] hover:border-[#D4AF37] transition text-left group shadow-xs hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gray">
              Treasury Wishlist
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-[#1A1A1A]">
            {wishlist.length}
          </div>
          <p className="text-xs text-luxury-gray mt-1 group-hover:text-[#D4AF37] transition flex items-center gap-1 font-medium">
            <span>View saved jewelry</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </button>
      </div>

      {/* Recent Orders Overview Section */}
      <div className="bg-white border border-[#E4E4E7] p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
          <div>
            <h3 className="text-base font-serif font-semibold text-[#1A1A1A]">
              Recent Activity & Orders
            </h3>
            <p className="text-xs text-luxury-gray">
              Track your latest orders and delivery status
            </p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37] hover:underline"
          >
            View All ({orders.length})
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-xs text-luxury-gray animate-pulse">
            Loading recent activity...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-luxury-gray">No orders placed yet.</p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1A1A] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-5 py-2 text-xs uppercase tracking-widest font-semibold transition"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#FDFBF7] border border-[#E4E4E7] gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#1A1A1A]">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-luxury-gray">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-luxury-gray mt-1">
                    {order.orderItems?.length || 0} item(s) • Total:{' '}
                    <strong className="text-[#D4AF37]">₹{order.totalPrice?.toLocaleString('en-IN')}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-300">
                    {order.orderStatus}
                  </span>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#1A1A1A] hover:text-[#D4AF37] underline"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
