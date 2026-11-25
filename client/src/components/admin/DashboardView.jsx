import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllOrdersApi } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export default function DashboardView({
  products = [],
  users = [],
  categories = [],
  onNavigateTab,
}) {
  const { unreadCount, latestOrderEvent } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [chartMetric, setChartMetric] = useState('revenue'); // 'revenue' | 'volume'
  const [distributionTab, setDistributionTab] = useState('categories'); // 'categories' | 'statuses'

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await getAllOrdersApi();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live real-time dashboard refresh on incoming customer order
  useEffect(() => {
    if (latestOrderEvent) {
      fetchOrders();
    }
  }, [latestOrderEvent, fetchOrders]);

  // ── Compute Key Dashboard Metrics ─────────────────────────────────────────
  const totalProducts = products.length;
  const totalCustomers = users.filter((u) => u.role !== 'admin').length || users.length;
  const lowStockProducts = products.filter((p) => (p.stock ?? 0) <= 5);
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;

  const totalOrders = orders.length;
  const validOrders = useMemo(() => orders.filter((o) => o.orderStatus !== 'Cancelled'), [orders]);
  const totalSales = useMemo(
    () => validOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0),
    [validOrders]
  );
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing' || o.orderStatus === 'Confirmed'
  ).length;

  // ── Compute Real Sales Timeline Chart Data ─────────────────────────────────
  const salesTimelineData = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Group orders by date (YYYY-MM-DD or Month)
    const grouped = {};
    orders.forEach((ord) => {
      const dateKey = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        : 'Unknown';
      if (!grouped[dateKey]) {
        grouped[dateKey] = { label: dateKey, revenue: 0, volume: 0 };
      }
      if (ord.orderStatus !== 'Cancelled') {
        grouped[dateKey].revenue += ord.totalPrice || 0;
      }
      grouped[dateKey].volume += 1;
    });

    // Return array sorted chronologically if timestamps exist
    return Object.values(grouped).slice(-7); // Last 7 active date buckets
  }, [orders]);

  const maxTimelineVal = useMemo(() => {
    if (salesTimelineData.length === 0) return 1;
    return Math.max(
      ...salesTimelineData.map((d) => (chartMetric === 'revenue' ? d.revenue : d.volume)),
      chartMetric === 'revenue' ? 1000 : 5
    );
  }, [salesTimelineData, chartMetric]);

  // ── Compute Distribution Analytics Data ───────────────────────────────────
  const categoryDistribution = useMemo(() => {
    if (!products || products.length === 0) return [];
    const counts = {};
    products.forEach((p) => {
      const catName =
        typeof p.category === 'object' && p.category?.name
          ? p.category.name
          : typeof p.category === 'string'
          ? p.category
          : 'Uncategorized';
      counts[catName] = (counts[catName] || 0) + 1;
    });
    const total = products.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [products]);

  const orderStatusDistribution = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const counts = {};
    orders.forEach((o) => {
      const st = o.orderStatus || 'Pending';
      counts[st] = (counts[st] || 0) + 1;
    });
    const total = orders.length;
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  }, [orders]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── TOP OVERVIEW METRIC CARDS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Orders Counter Card */}
        <div
          onClick={() => onNavigateTab && onNavigateTab('orders')}
          className="bg-gradient-to-br from-amber-50 to-white p-5 border border-luxury-gold/50 shadow-xs hover:shadow-md rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer hover:border-luxury-gold"
          title="Click to view new orders in Order Management"
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 flex items-center gap-1.5">
              <span>New Orders</span>
              {unreadCount > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </span>
            <span className="text-2xl lg:text-3xl font-serif font-bold text-luxury-charcoal">
              {unreadCount}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
              <span className="bg-amber-100/90 text-amber-950 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-100/80 group-hover:bg-amber-200 rounded-xl flex items-center justify-center text-luxury-gold shrink-0 transition-colors shadow-xs">
            <svg className="w-6 h-6 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-5 border border-luxury-border shadow-xs hover:shadow-md rounded-xl transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">
              Total Revenue
            </span>
            <span className="text-2xl lg:text-3xl font-serif font-bold text-luxury-charcoal">
              ₹{totalSales.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
              <span className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                AOV: ₹{avgOrderValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 group-hover:bg-amber-100 rounded-xl flex items-center justify-center text-luxury-gold shrink-0 transition-colors">
            <span className="font-bold text-xl font-serif">₹</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 border border-luxury-border shadow-xs hover:shadow-md rounded-xl transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">
              Total Orders
            </span>
            <span className="text-2xl lg:text-3xl font-serif font-bold text-luxury-charcoal">
              {totalOrders}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {pendingOrdersCount} pending fulfillment
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 border border-luxury-border shadow-xs hover:shadow-md rounded-xl transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">
              Total Products
            </span>
            <span className="text-2xl lg:text-3xl font-serif font-bold text-luxury-charcoal">
              {totalProducts}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  outOfStockCount > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {outOfStockCount > 0 ? `${outOfStockCount} out of stock` : 'All items in stock'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 border border-luxury-border shadow-xs hover:shadow-md rounded-xl transition-all duration-200 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">
              Registered Customers
            </span>
            <span className="text-2xl lg:text-3xl font-serif font-bold text-luxury-charcoal">
              {totalCustomers}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                User Accounts
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── RESPONSIVE CHARTS SECTION ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* CHART 1: Real Sales & Volume Timeline (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-luxury-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-luxury-charcoal">
                Sales & Performance Overview
              </h3>
              <p className="text-xs text-stone-500">Computed live from customer transactions</p>
            </div>

            {/* Toggle Revenue vs Volume */}
            <div className="flex items-center bg-stone-100 p-1 rounded-lg self-start sm:self-auto text-xs">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  chartMetric === 'revenue'
                    ? 'bg-white text-luxury-charcoal shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('volume')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  chartMetric === 'volume'
                    ? 'bg-white text-luxury-charcoal shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Order Volume
              </button>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-2">
            {salesTimelineData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-stone-200 rounded-lg p-6 text-center">
                <svg className="w-10 h-10 text-stone-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-xs font-semibold text-stone-600">No transaction data recorded yet</p>
                <p className="text-[11px] text-stone-400 mt-1">Placed customer orders will dynamically generate real sales timelines here.</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="h-60 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Background Grid Lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#F4F4F5" strokeWidth="1" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#F4F4F5" strokeWidth="1" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#F4F4F5" strokeWidth="1" />
                    <line x1="0" y1="170" x2="500" y2="170" stroke="#E4E4E7" strokeWidth="1.5" />

                    {/* SVG Bars */}
                    {salesTimelineData.map((d, index) => {
                      const val = chartMetric === 'revenue' ? d.revenue : d.volume;
                      const barHeight = Math.max((val / maxTimelineVal) * 140, 6);
                      const barWidth = 32;
                      const gap = (500 - salesTimelineData.length * barWidth) / (salesTimelineData.length + 1);
                      const x = gap + index * (barWidth + gap);
                      const y = 170 - barHeight;

                      return (
                        <g key={index} className="group cursor-pointer">
                          {/* Gradient Definitions */}
                          <defs>
                            <linearGradient id={`barGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#9A7B1C" stopOpacity="0.95" />
                            </linearGradient>
                          </defs>

                          {/* Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx="4"
                            fill={`url(#barGrad-${index})`}
                            className="transition-all duration-300 group-hover:opacity-80"
                          />

                          {/* Top Value Label */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 6}
                            textAnchor="middle"
                            className="text-[10px] font-bold fill-stone-700 opacity-80 group-hover:opacity-100"
                          >
                            {chartMetric === 'revenue' ? `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}` : val}
                          </text>

                          {/* X-Axis Date Label */}
                          <text
                            x={x + barWidth / 2}
                            y="190"
                            textAnchor="middle"
                            className="text-[10px] font-medium fill-stone-500"
                          >
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Catalogue & Order Distribution (1 Column) */}
        <div className="bg-white border border-luxury-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-luxury-charcoal">
                Distribution Analytics
              </h3>
              <div className="flex bg-stone-100 p-0.5 rounded text-[11px]">
                <button
                  onClick={() => setDistributionTab('categories')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    distributionTab === 'categories'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => setDistributionTab('statuses')}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    distributionTab === 'statuses'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500'
                  }`}
                >
                  Statuses
                </button>
              </div>
            </div>

            {/* Content: Categories breakdown */}
            {distributionTab === 'categories' && (
              <div className="space-y-3.5 pt-1">
                {categoryDistribution.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-8">No category data available.</p>
                ) : (
                  categoryDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-700">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-mono text-stone-500 shrink-0">{item.count} items ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-luxury-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Content: Order Statuses breakdown */}
            {distributionTab === 'statuses' && (
              <div className="space-y-3.5 pt-1">
                {orderStatusDistribution.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-8">No order status data available.</p>
                ) : (
                  orderStatusDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-stone-700">
                        <span className="truncate pr-2">{item.status}</span>
                        <span className="font-mono text-stone-500 shrink-0">{item.count} orders ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.status === 'Delivered'
                              ? 'bg-green-500'
                              : item.status === 'Shipped'
                              ? 'bg-blue-500'
                              : item.status === 'Processing'
                              ? 'bg-amber-500'
                              : item.status === 'Cancelled'
                              ? 'bg-red-500'
                              : 'bg-stone-400'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400 text-center">
            Updated in real-time from server state
          </div>
        </div>
      </div>

      {/* ── LOW STOCK & RECENT ORDERS SECTION ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Low Stock Alerts (1 Column) */}
        <div className="bg-white border border-luxury-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base text-luxury-charcoal">
                    Low Stock Alerts
                  </h3>
                  {lowStockProducts.length > 0 && (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {lowStockProducts.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">Products requiring restocking</p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs uppercase tracking-wider font-bold text-luxury-gold hover:text-amber-700 transition"
              >
                Inventory →
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-10 space-y-2 border border-dashed border-stone-200 rounded-lg">
                <span className="text-2xl">✨</span>
                <p className="text-xs font-semibold text-emerald-700">Healthy Inventory Levels!</p>
                <p className="text-[11px] text-stone-500">All products currently exceed low stock threshold.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {lowStockProducts.map((p) => {
                  const imgUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image || null;
                  return (
                    <div
                      key={p._id}
                      className="flex items-center justify-between p-3 border border-stone-100 bg-stone-50/60 rounded-lg text-xs hover:border-amber-200 transition"
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                            💎
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-bold text-luxury-charcoal truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-500">
                            Category: {typeof p.category === 'object' ? p.category?.name : p.category || 'Standard'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-md ${
                            p.stock === 0
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} remaining`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full py-2 text-xs font-bold text-center text-luxury-gold bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
          >
            Manage Inventory & Stock Levels
          </button>
        </div>

        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-luxury-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base text-luxury-charcoal">
                Recent Customer Orders
              </h3>
              <p className="text-xs text-stone-500">Latest transactions placed in store</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs uppercase tracking-wider font-bold text-luxury-gold hover:text-amber-700 transition"
            >
              All Orders →
            </button>
          </div>

          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold" />
            </div>
          ) : (
            <>
              {/* Desktop Table View (sm and up) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs text-luxury-charcoal border-collapse">
                  <thead>
                    <tr className="bg-stone-50 uppercase tracking-wider text-[10px] text-stone-500 border-b border-stone-200">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord._id} className="hover:bg-stone-50/80 transition">
                        <td className="py-3 px-3 font-mono font-bold text-luxury-gold text-[11px]">
                          #{ord._id ? ord._id.substring(ord._id.length - 8) : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-stone-900">
                            {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate max-w-[140px]">
                            {ord.user?.email || 'Guest'}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-stone-500 font-medium">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          ₹{(ord.totalPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                              ord.isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {ord.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                          <p className="text-[9px] text-stone-400 mt-0.5 truncate max-w-[80px]">
                            {ord.paymentMethod || 'COD'}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : ord.orderStatus === 'Processing'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            {ord.orderStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-stone-400 text-xs">
                          No recent orders recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View (< sm) */}
              <div className="sm:hidden space-y-3">
                {orders.slice(0, 6).map((ord) => (
                  <div
                    key={ord._id}
                    className="p-3.5 border border-stone-100 bg-stone-50/50 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-luxury-gold text-[11px] block">
                          #{ord._id ? ord._id.substring(ord._id.length - 8) : 'N/A'}
                        </span>
                        <p className="font-semibold text-stone-900 mt-0.5">
                          {ord.shippingAddress?.fullName || ord.user?.name || 'Customer'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : ord.orderStatus === 'Processing'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {ord.orderStatus || 'Pending'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-stone-500 text-[11px] pt-1 border-t border-stone-200/50">
                      <div>
                        <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                        <span className="mx-1.5">•</span>
                        <span
                          className={`font-semibold ${
                            ord.isPaid ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {ord.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                      <span className="font-bold text-stone-900 text-xs">
                        ₹{(ord.totalPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    No recent orders recorded yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
