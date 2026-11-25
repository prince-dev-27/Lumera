import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrdersApi } from '../../services/api';
import OrderDetailsModal from '../OrderDetailsModal';

export default function OrderHistoryTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyOrdersApi();
      if (res.success) {
        setOrders(res.data || []);
      } else {
        throw new Error(res.message || 'Failed to fetch order history');
      }
    } catch (err) {
      setError(err.message || 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Packed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Shipped':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'Out for Delivery':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.orderStatus === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      order._id.toLowerCase().includes(q) ||
      order.orderItems?.some((item) => item.name?.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E4E4E7] gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#1A1A1A]">
            Order History
          </h2>
          <p className="text-xs text-luxury-gray">
            View details, track delivery status, and review past purchases
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37] px-4 py-2 hover:bg-amber-50 font-semibold transition"
        >
          Refresh Orders
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOrders} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 border border-[#E4E4E7]">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition border ${
                statusFilter === st
                  ? 'bg-[#1A1A1A] text-[#D4AF37] border-[#1A1A1A]'
                  : 'bg-[#FDFBF7] text-luxury-gray border-transparent hover:border-stone-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or item..."
            className="w-full bg-[#FDFBF7] border border-[#E4E4E7] py-1.5 pl-3 pr-8 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4 py-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-[#E4E4E7] p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-stone-200 rounded w-1/3" />
              <div className="h-16 bg-stone-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white border border-[#E4E4E7] space-y-4">
          <div className="flex justify-center text-[#D4AF37]/40">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-[#1A1A1A]">
            {orders.length === 0 ? 'No Orders Placed Yet' : 'No Orders Match Your Filter'}
          </h3>
          <p className="text-xs text-luxury-gray max-w-sm mx-auto font-light leading-relaxed">
            {orders.length === 0
              ? 'You have not placed any orders yet. Discover our handcrafted luxury jewelry today!'
              : 'Try clearing your search query or selecting a different status tab.'}
          </p>
          {orders.length === 0 && (
            <Link
              to="/shop"
              className="inline-block bg-[#D4AF37] text-[#1A1A1A] hover:bg-[#bd863e] hover:text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold transition"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-[#E4E4E7] shadow-xs overflow-hidden hover:border-[#D4AF37]/60 transition"
            >
              {/* Card Header Bar */}
              <div className="bg-[#FDFBF7] px-6 py-4 border-b border-[#E4E4E7] flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-[10px] text-luxury-gray uppercase font-bold block">
                      Order Placed
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-gray uppercase font-bold block">
                      Total Amount
                    </span>
                    <span className="font-bold text-[#D4AF37]">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-luxury-gray uppercase font-bold block">
                      Ship To
                    </span>
                    <span className="font-medium text-[#1A1A1A]">
                      {order.shippingAddress?.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] text-luxury-gray uppercase font-bold block text-right">
                      Status
                    </span>
                    <span
                      className={`inline-block px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold border ${getStatusBadgeClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                  <span className="text-stone-300 font-mono hidden sm:inline">|</span>
                  <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 overflow-x-auto py-1 max-w-full">
                  {order.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 shrink-0">
                      <div className="w-14 h-14 bg-stone-100 border border-[#E4E4E7] overflow-hidden relative">
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 bg-[#1A1A1A] text-white text-[9px] px-1 font-mono font-bold">
                          x{item.quantity}
                        </span>
                      </div>
                      <div className="hidden lg:block max-w-[150px]">
                        <h4 className="text-xs font-serif font-bold text-[#1A1A1A] truncate">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-luxury-gray">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full sm:w-auto bg-[#1A1A1A] text-[#FDFBF7] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition shrink-0 shadow-xs"
                >
                  View Order Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
