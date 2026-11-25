import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShopProvider, ShopContext } from './context/ShopContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LumeraLoader from './components/LumeraLoader';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Route Protection Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReturnExchangePolicy from './pages/ReturnExchangePolicy';
import NotFound from './pages/NotFound';

function NetworkErrorBanner() {
  const { networkErrorBanner, dismissNetworkError } = React.useContext(ShopContext);
  if (!networkErrorBanner) return null;

  return (
    <div className="bg-red-950 text-red-100 px-4 py-3 shadow-lg border-b border-red-800 flex items-center justify-between text-xs sm:text-sm font-medium z-50 sticky top-0">
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full px-4 justify-between">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{networkErrorBanner}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-xs font-semibold tracking-wide transition border border-red-700"
          >
            Retry Connection
          </button>
          <button
            onClick={dismissNetworkError}
            className="text-red-300 hover:text-white p-1 transition"
            title="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastBanner() {
  const { toastNotice } = React.useContext(ShopContext);
  if (!toastNotice) return null;

  const isSuccess = toastNotice.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div
        className={`px-4 py-3 shadow-xl border flex items-center justify-between text-xs font-semibold tracking-wide ${
          isSuccess
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : 'bg-red-900 text-red-100 border-red-700'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span>{toastNotice.message}</span>
        </div>
      </div>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const { loading: authLoading } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (authLoading) {
    return <LumeraLoader text="Initializing Lumera Vault..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] relative">
      <NetworkErrorBanner />
      <ToastBanner />
      {/* Main Navigation (Hidden on Admin routes) */}
      {!isAdminRoute && <Navbar />}

      {/* Dynamic Page Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Customer Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/return-exchange-policy" element={<ReturnExchangePolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer Section (Hidden on Admin routes) */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <Router>
          <MainLayout />
        </Router>
      </ShopProvider>
    </AuthProvider>
  );
}

