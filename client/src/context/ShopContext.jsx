import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import useCategories from '../hooks/useCategories';
import { useAuth } from './AuthContext';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  syncCartApi,
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  moveToCartApi,
  syncWishlistApi,
  setGlobalNetworkErrorHandler
} from '../services/api';

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // ── Cart & Wishlist state ──────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('lumera_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('lumera_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);
  const [networkErrorBanner, setNetworkErrorBanner] = useState(null);

  const productVersionRef = useRef({});

  // Helper to show brief toast notification
  const showToast = useCallback((message, type = 'error') => {
    setToastNotice({ message, type });
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  }, []);

  const dismissNetworkError = useCallback(() => {
    setNetworkErrorBanner(null);
  }, []);

  useEffect(() => {
    setGlobalNetworkErrorHandler((message) => {
      setNetworkErrorBanner(message);
    });
    return () => {
      setGlobalNetworkErrorHandler(null);
    };
  }, []);

  // ── Shop filter / sort state ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(5000);
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Categories from API ───────────────────────────────────────────────────
  const { categories } = useCategories();

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortOption]);

  // ── Initial load & sync with MongoDB when authenticated ────────────────────
  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated) return;

      setCartLoading(true);
      setWishlistLoading(true);

      try {
        // Check for guest cart in localStorage to sync
        const localCartRaw = localStorage.getItem('lumera_cart');
        const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];

        if (localCart.length > 0) {
          const formattedCart = localCart.map((item) => ({
            productId: item.product?._id || item.product?.id || item.product,
            quantity: item.quantity
          }));
          await syncCartApi(formattedCart);
          localStorage.removeItem('lumera_cart');
        }

        // Check for guest wishlist in localStorage to sync
        const localWishlistRaw = localStorage.getItem('lumera_wishlist');
        const localWishlist = localWishlistRaw ? JSON.parse(localWishlistRaw) : [];

        if (localWishlist.length > 0) {
          const formattedWishlist = localWishlist.map(
            (p) => p._id || p.id || p
          );
          await syncWishlistApi(formattedWishlist);
          localStorage.removeItem('lumera_wishlist');
        }

        // Fetch user's cart from MongoDB
        const cartRes = await getCartApi();
        if (cartRes.success) {
          setCart(cartRes.data);
        }

        // Fetch user's wishlist from MongoDB
        const wishlistRes = await getWishlistApi();
        if (wishlistRes.success) {
          setWishlist(wishlistRes.data);
        }
      } catch (err) {
        console.error('Failed to sync/fetch cart & wishlist:', err);
      } finally {
        setCartLoading(false);
        setWishlistLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated]);

  // ── Persist to localStorage when guest ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('lumera_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('lumera_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    const productId = product._id || product.id;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Stock check
    if (product.stock !== undefined && product.stock <= 0) {
      showToast(`"${product.name}" is currently out of stock.`, 'error');
      return false;
    }

    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await addToCartApi(productId, qty);
        if (res.success) {
          setCart(res.data);
          showToast(`Added "${product.name}" to your bag`, 'success');
          return true;
        }
      } catch (err) {
        showToast(err.message || 'Failed to add item to cart', 'error');
        return false;
      } finally {
        setCartLoading(false);
      }
    } else {
      // Guest cart logic with stock validation
      let success = true;
      setCart((prev) => {
        const existing = prev.find(
          (item) => (item.product._id || item.product.id) === productId
        );
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = currentQty + qty;

        const maxStock = product.stock !== undefined ? product.stock : 999;
        if (targetQty > maxStock) {
          showToast(
            `Cannot add ${qty} more items. Stock limit is ${maxStock} (${currentQty} already in bag).`,
            'error'
          );
          success = false;
          return prev;
        }

        showToast(`Added "${product.name}" to your bag`, 'success');

        if (existing) {
          return prev.map((item) =>
            (item.product._id || item.product.id) === productId
              ? { ...item, quantity: targetQty }
              : item
          );
        }
        return [...prev, { product, quantity: qty }];
      });
      return success;
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await removeFromCartApi(productId);
        if (res.success) {
          setCart(res.data);
          showToast('Item removed from cart', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to remove item', 'error');
      } finally {
        setCartLoading(false);
      }
    } else {
      setCart((prev) =>
        prev.filter(
          (item) => (item.product._id || item.product.id) !== productId
        )
      );
      showToast('Item removed from cart', 'success');
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Find product stock limit
    const existing = cart.find(
      (item) => (item.product._id || item.product.id) === productId
    );
    const productStock = existing?.product?.stock;

    if (productStock !== undefined && qty > productStock) {
      showToast(
        `Cannot set quantity to ${qty}. Maximum available stock is ${productStock}.`,
        'error'
      );
      return;
    }

    // Optimistic local update for instant UI response and smooth rapid interactions
    setCart((prev) =>
      prev.map((item) =>
        (item.product._id || item.product.id) === productId
          ? { ...item, quantity: qty }
          : item
      )
    );

    if (isAuthenticated) {
      const currentVersion = (productVersionRef.current[productId] || 0) + 1;
      productVersionRef.current[productId] = currentVersion;

      try {
        const res = await updateCartItemApi(productId, qty);
        // Only apply server response if this remains the latest request for this product
        if (res.success && productVersionRef.current[productId] === currentVersion) {
          setCart(res.data);
        }
      } catch (err) {
        if (productVersionRef.current[productId] === currentVersion) {
          showToast(err.message || 'Failed to update quantity', 'error');
          // Resync cart from server on failure
          try {
            const cartRes = await getCartApi();
            if (cartRes.success) setCart(cartRes.data);
          } catch (_e) {}
        }
      }
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      setCartLoading(true);
      try {
        const res = await clearCartApi();
        if (res.success) {
          setCart([]);
          showToast('Bag cleared', 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to clear cart', 'error');
      } finally {
        setCartLoading(false);
      }
    } else {
      setCart([]);
      showToast('Bag cleared', 'success');
    }
  };

  // ── Wishlist actions ──────────────────────────────────────────────────────
  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const isWishlisted = wishlist.some(
      (item) => (item._id || item.id) === productId
    );

    if (isAuthenticated) {
      setWishlistLoading(true);
      try {
        if (isWishlisted) {
          const res = await removeFromWishlistApi(productId);
          if (res.success) {
            setWishlist(res.data);
            showToast(`Removed "${product.name}" from wishlist`, 'success');
          }
        } else {
          const res = await addToWishlistApi(productId);
          if (res.success) {
            setWishlist(res.data);
            showToast(`Added "${product.name}" to wishlist`, 'success');
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to update wishlist', 'error');
      } finally {
        setWishlistLoading(false);
      }
    } else {
      setWishlist((prev) => {
        const exists = prev.some(
          (item) => (item._id || item.id) === productId
        );
        if (exists) {
          showToast(`Removed "${product.name}" from wishlist`, 'success');
          return prev.filter((item) => (item._id || item.id) !== productId);
        } else {
          showToast(`Added "${product.name}" to wishlist`, 'success');
          return [...prev, product];
        }
      });
    }
  };

  const moveToCart = async (product, quantity = 1) => {
    const productId = product._id || product.id;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (product.stock !== undefined && product.stock <= 0) {
      showToast(`"${product.name}" is out of stock.`, 'error');
      return;
    }

    if (isAuthenticated) {
      setCartLoading(true);
      setWishlistLoading(true);
      try {
        const res = await moveToCartApi(productId, qty);
        if (res.success) {
          setCart(res.data.cart);
          setWishlist(res.data.wishlist);
          showToast(`Moved "${product.name}" to your bag`, 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to move product to cart', 'error');
      } finally {
        setCartLoading(false);
        setWishlistLoading(false);
      }
    } else {
      const added = await addToCart(product, qty);
      if (added !== false) {
        setWishlist((prev) =>
          prev.filter((item) => (item._id || item.id) !== productId)
        );
      }
    }
  };

  // ── Computed cart totals ──────────────────────────────────────────────────
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((total, item) => {
    if (!item.product) return total;
    const finalPrice = item.product.discountPrice || item.product.price;
    return total + finalPrice * item.quantity;
  }, 0);

  return (
    <ShopContext.Provider
      value={{
        // Categories
        categories,
        // Cart
        cart,
        cartLoading,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        // Wishlist
        wishlist,
        wishlistLoading,
        toggleWishlist,
        moveToCart,
        // Toast Notice & Network Error
        toastNotice,
        showToast,
        networkErrorBanner,
        dismissNetworkError,
        // Filter / sort / pagination state
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        priceRange,
        setPriceRange,
        sortOption,
        setSortOption,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
