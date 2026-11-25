import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories } from '../services/api';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardView from '../components/admin/DashboardView';
import ProductManagement from '../components/admin/ProductManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import InventoryManagement from '../components/admin/InventoryManagement';
import OrderManagement from '../components/admin/OrderManagement';
import CouponManagement from '../components/admin/CouponManagement';
import ReviewManagement from '../components/admin/ReviewManagement';
import CustomerManagement from '../components/admin/CustomerManagement';
import { NotificationProvider } from '../context/NotificationContext';
import OrderToast from '../components/admin/OrderToast';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setActiveTab('orders');
  };

  // ── Products Data State ───────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      // Pass all: true so admins can fetch active AND inactive/disabled products
      const res = await getProducts({ all: 'true', limit: 100 });
      setProducts(res.data || []);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // ── Categories Data State ──────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      // Pass all: true so admins can fetch active AND inactive categories
      const res = await getCategories({ all: 'true' });
      setCategories(res.data || []);
    } catch (err) {
      setCategoriesError(err.message);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // ── Users/Customers Data State ─────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  // Initial load on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
    if (token) loadUsers();
  }, [loadProducts, loadCategories, loadUsers, token]);

  return (
    <NotificationProvider>
      <OrderToast onSelectOrder={handleSelectOrder} />
      <AdminLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        onSelectOrder={handleSelectOrder}
      >
        {/* ── TAB 1: DASHBOARD OVERVIEW ── */}
        {activeTab === 'dashboard' && (
          <DashboardView
            products={products}
            users={users}
            categories={categories}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* ── TAB 2: PRODUCT MANAGEMENT ── */}
        {activeTab === 'products' && (
          <ProductManagement
            products={products}
            categories={categories}
            loading={productsLoading}
            error={productsError}
            onRefresh={loadProducts}
          />
        )}

        {/* ── TAB 3: CATEGORY MANAGEMENT ── */}
        {activeTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            onRefresh={loadCategories}
          />
        )}

        {/* ── TAB 4: INVENTORY MANAGEMENT ── */}
        {activeTab === 'inventory' && (
          <InventoryManagement
            products={products}
            loading={productsLoading}
            error={productsError}
            onRefresh={loadProducts}
          />
        )}

        {/* ── TAB 5: ORDER MANAGEMENT ── */}
        {activeTab === 'orders' && (
          <OrderManagement
            initialSelectedOrderId={selectedOrderId}
            onClearInitialOrder={() => setSelectedOrderId(null)}
          />
        )}

        {/* ── TAB 6: COUPON MANAGEMENT ── */}
        {activeTab === 'coupons' && <CouponManagement />}

        {/* ── TAB 7: REVIEWS MODERATION ── */}
        {activeTab === 'reviews' && <ReviewManagement />}

        {/* ── TAB 8: CUSTOMER / USER ACCOUNTS ── */}
        {activeTab === 'users' && (
          <CustomerManagement
            users={users}
            loading={usersLoading}
            error={usersError}
            onRefresh={loadUsers}
          />
        )}
      </AdminLayout>
    </NotificationProvider>
  );
}
