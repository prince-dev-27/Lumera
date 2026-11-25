import React, { useState, useEffect, useCallback } from 'react';
import { getAllOrdersApi, updateOrderStatusApi, getOrderByIdApi } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import Pagination from './Pagination';

const ORDER_STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

export default function OrderManagement({ initialSelectedOrderId, onClearInitialOrder }) {
  const { latestOrderEvent } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateNotice, setUpdateNotice] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllOrdersApi({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm.trim() || undefined
      });
      if (res.success) {
        setOrders(res.data || []);
      } else {
        throw new Error(res.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reload orders in real-time when a new order event is received via socket
  useEffect(() => {
    if (latestOrderEvent) {
      loadOrders();
    }
  }, [latestOrderEvent, loadOrders]);

  const handleOpenManageModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setUpdateNotice(null);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    if (onClearInitialOrder) {
      onClearInitialOrder();
    }
  };

  // Auto-open selected order if passed from notification click
  useEffect(() => {
    if (initialSelectedOrderId) {
      const match = orders.find((o) => o._id === initialSelectedOrderId);
      if (match) {
        handleOpenManageModal(match);
      } else {
        getOrderByIdApi(initialSelectedOrderId)
          .then((res) => {
            if (res && res.data) {
              handleOpenManageModal(res.data);
            }
          })
          .catch((err) => console.warn('Could not auto-open order:', err));
      }
    }
  }, [initialSelectedOrderId, orders]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !newStatus) return;

    setUpdating(true);
    setUpdateNotice(null);

    try {
      const res = await updateOrderStatusApi(selectedOrder._id, newStatus);
      if (res.success && res.data) {
        setUpdateNotice({ type: 'success', message: `Order status successfully updated to "${newStatus}"` });
        setSelectedOrder(res.data);
        // Refresh local orders list
        setOrders((prev) =>
          prev.map((o) => (o._id === res.data._id ? res.data : o))
        );
      } else {
        throw new Error(res.message || 'Failed to update order status');
      }
    } catch (err) {
      setUpdateNotice({ type: 'error', message: err.message || 'Status update failed' });
    } finally {
      setUpdating(false);
    }
  };

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

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const deliveredOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Pagination Math
  const totalItems = orders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Summary Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-luxury-border rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block">Total Orders</span>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">{totalOrdersCount}</div>
          <span className="text-[11px] text-stone-400">All recorded orders</span>
        </div>

        <div className="bg-white p-5 border border-luxury-border rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">Pending / In Progress</span>
          <div className="text-2xl font-bold font-serif text-amber-700 mt-1">{pendingOrdersCount}</div>
          <span className="text-[11px] text-stone-400">Action required</span>
        </div>

        <div className="bg-white p-5 border border-luxury-border rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block">Delivered Orders</span>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">{deliveredOrdersCount}</div>
          <span className="text-[11px] text-stone-400">Completed fulfillments</span>
        </div>

        <div className="bg-white p-5 border border-luxury-border rounded-xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold block">Total Sales Value</span>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-stone-400">Excludes cancelled orders</span>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-white p-4 sm:p-5 border border-luxury-border rounded-xl shadow-xs flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 whitespace-nowrap hidden sm:inline">
              Filter Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto bg-stone-50 border border-luxury-border rounded-lg px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-luxury-gold font-medium"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative flex-grow max-w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-stone-50 border border-luxury-border rounded-lg pl-9 pr-8 py-2 text-xs text-stone-800 focus:outline-none focus:border-luxury-gold focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <button
          onClick={loadOrders}
          className="w-full lg:w-auto text-xs bg-luxury-gold text-stone-900 px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider hover:bg-[#bd863e] hover:text-white transition shrink-0 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Orders
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
          {error}
        </div>
      )}

      {/* 3. Orders List */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white border border-luxury-border rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
        </div>
      ) : (
        <div className="bg-white border border-luxury-border rounded-xl shadow-xs overflow-hidden">
          {/* Desktop Table View (lg and up) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-800 border-collapse">
              <thead>
                <tr className="bg-stone-50 uppercase tracking-widest text-[10px] text-stone-500 border-b border-luxury-border">
                  <th className="py-3.5 px-4 font-bold">Order ID</th>
                  <th className="py-3.5 px-4 font-bold">Customer Name</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                  <th className="py-3.5 px-4 text-center font-bold">Items</th>
                  <th className="py-3.5 px-4 text-right font-bold">Total Price</th>
                  <th className="py-3.5 px-4 font-bold">Payment</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500 font-bold">
                      #{order._id ? order._id.substring(order._id.length - 8) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900">
                        {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate max-w-[150px]">{order.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-stone-700">
                      {order.orderItems?.length || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-luxury-gold">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-stone-700 block">
                        {order.paymentMethod}
                      </span>
                      <span className={`text-[9px] uppercase font-bold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusBadgeClass(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenManageModal(order)}
                        className="bg-stone-900 text-white hover:bg-luxury-gold hover:text-stone-900 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition"
                      >
                        View / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (< lg) */}
          <div className="lg:hidden divide-y divide-stone-100">
            {currentOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3 bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-luxury-gold block">
                      #{order._id ? order._id.substring(order._id.length - 8) : 'N/A'}
                    </span>
                    <h4 className="font-bold text-sm text-stone-900 mt-0.5">
                      {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                    </h4>
                    <p className="text-xs text-stone-500">{order.user?.email || 'Guest'}</p>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border shrink-0 ${getStatusBadgeClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Date & Payment</span>
                    <span className="text-stone-700 font-medium block">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                    </span>
                    <span className={`text-[10px] uppercase font-bold ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.paymentMethod} ({order.isPaid ? 'Paid' : 'Unpaid'})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Items & Total</span>
                    <span className="text-stone-600 font-medium block">{order.orderItems?.length || 0} item(s)</span>
                    <span className="font-bold text-luxury-gold text-sm">
                      ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenManageModal(order)}
                    className="w-full sm:w-auto bg-stone-900 text-white hover:bg-luxury-gold hover:text-stone-900 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition text-center"
                  >
                    View / Update Order
                  </button>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="py-16 text-center text-xs text-stone-500 font-light">
              No orders found matching the specified search or filter criteria.
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
          />
        </div>
      )}

      {/* 4. Admin Order Details & Status Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-stone-200 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1C1917] text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-bold block">
                  Admin Order Management
                </span>
                <h2 className="text-xs sm:text-sm font-mono font-bold text-stone-200 truncate">
                  Order ID: #{selectedOrder._id}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-stone-800 transition leading-none"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {updateNotice && (
                <div
                  className={`p-3 text-xs font-bold rounded-lg border ${
                    updateNotice.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                  }`}
                >
                  {updateNotice.message}
                </div>
              )}

              {/* Status Update Controls Form */}
              <div className="bg-stone-50 p-4 sm:p-5 border border-stone-300 rounded-xl space-y-3">
                <h3 className="text-xs font-serif uppercase tracking-widest font-bold text-stone-800">
                  Update Order Fulfillment Status
                </h3>
                <form onSubmit={handleUpdateStatus} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-grow">
                    <label className="block text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">
                      Select New Status:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-luxury-gold"
                    >
                      {ORDER_STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={updating || newStatus === selectedOrder.orderStatus}
                    className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-xs whitespace-nowrap ${
                      updating || newStatus === selectedOrder.orderStatus
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-luxury-gold text-stone-900 hover:bg-[#bd863e] hover:text-white'
                    }`}
                  >
                    {updating ? 'Updating...' : 'Save Status Update'}
                  </button>
                </form>
                <p className="text-[10px] text-stone-500">
                  Current Status: <strong className="text-stone-800">{selectedOrder.orderStatus}</strong>
                </p>
              </div>

              {/* Order Info & Address Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                    Customer Account
                  </span>
                  <p className="font-bold text-stone-900">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-stone-600">{selectedOrder.user?.email}</p>
                  <p className="text-stone-600">Contact Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block mb-1">
                    Shipping Destination
                  </span>
                  <p className="text-stone-900 font-medium">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-stone-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}</p>
                  <p className="text-stone-600">{selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-serif uppercase tracking-widest font-bold text-stone-800 mb-3">
                  Ordered Items ({selectedOrder.orderItems?.length || 0})
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs text-stone-800 border-collapse">
                    <thead>
                      <tr className="bg-stone-100 uppercase text-[10px] text-stone-600 border-b border-stone-200">
                        <th className="py-2.5 px-4 font-bold">Product</th>
                        <th className="py-2.5 px-4 text-center font-bold">Qty</th>
                        <th className="py-2.5 px-4 text-right font-bold">Unit Price</th>
                        <th className="py-2.5 px-4 text-right font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {selectedOrder.orderItems?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=200&auto=format&fit=crop&q=80'}
                                alt={item.name}
                                className="w-10 h-10 object-cover border border-stone-200 rounded-lg shrink-0"
                              />
                              <span className="font-bold text-stone-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-stone-600">₹{item.price?.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right font-bold text-stone-900">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status History & Payment Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 font-bold block">
                    Status Audit Trail
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 text-[11px] pr-1 custom-scrollbar">
                    {selectedOrder.statusHistory?.map((h, i) => (
                      <div key={i} className="flex justify-between border-b border-stone-200/60 pb-1 text-stone-600">
                        <span className="font-semibold text-stone-800">{h.status}</span>
                        <span className="text-stone-400">{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 p-4 border border-stone-200 rounded-xl space-y-2">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-800">₹{selectedOrder.itemsPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedOrder.couponDiscount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Coupon ({selectedOrder.couponCode})</span>
                      <span className="font-semibold">-₹{selectedOrder.couponDiscount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-stone-800">
                      {selectedOrder.shippingPrice === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${selectedOrder.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600 border-t border-stone-200 pt-2 font-bold text-sm">
                    <span className="text-stone-900">Grand Total</span>
                    <span className="text-luxury-gold">₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 pt-1">
                    Payment Method: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.isPaid ? 'Paid' : 'Unpaid'})
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-stone-100 border-t border-stone-200 px-6 py-3 flex justify-end shrink-0">
              <button
                onClick={handleCloseModal}
                className="bg-stone-900 text-white hover:bg-stone-800 px-6 py-2 text-xs uppercase tracking-widest font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
