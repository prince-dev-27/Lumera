/**
 * Lumera API Service
 * Centralised fetch wrapper for all backend API calls.
 */

const BASE = '/api';

/** Read JWT token from localStorage */
function getToken() {
  return localStorage.getItem('lumera_token') || null;
}

/** Build Authorization header when a token exists */
function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Generic request helper */
async function request(endpoint, options = {}) {
  const { body, method = 'GET', ...rest } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(rest.headers || {}),
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

/**
 * Fetch products with optional filtering / sorting / pagination.
 * @param {Object} params
 * @param {string}  [params.search]
 * @param {string}  [params.category]   - slug or ObjectId
 * @param {number}  [params.minPrice]
 * @param {number}  [params.maxPrice]
 * @param {string}  [params.sort]       - 'newest' | 'price-low-high' | 'price-high-low'
 * @param {boolean} [params.featured]
 * @param {number}  [params.page]
 * @param {number}  [params.limit]
 * @returns {Promise<{success, count, total, page, pages, data}>}
 */
export async function getProducts(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/products${query}`);
}

/**
 * Get a single product by MongoDB _id or slug.
 * @param {string} id
 */
export async function getProductById(id) {
  return request(`/products/${id}`);
}

/**
 * Create a product (Admin only).
 * @param {Object} data
 */
export async function createProduct(data) {
  return request('/products', { method: 'POST', body: data });
}

/**
 * Update a product (Admin only).
 * @param {string} id
 * @param {Object} data
 */
export async function updateProduct(id, data) {
  return request(`/products/${id}`, { method: 'PUT', body: data });
}

/**
 * Delete a product (Admin only).
 * @param {string} id
 */
export async function deleteProduct(id) {
  return request(`/products/${id}`, { method: 'DELETE' });
}

/**
 * Upload multiple product images to Cloudinary (Admin only).
 * @param {Array<File>|FileList} files
 */
export async function uploadProductImagesApi(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${BASE}/upload/images`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Image upload failed: ${res.status}`);
  }

  return data;
}

/**
 * Remove a single product image from Cloudinary (Admin only).
 * @param {string} imageUrl
 */
export async function deleteProductImageApi(imageUrl) {
  return request('/upload/image', {
    method: 'DELETE',
    body: { imageUrl },
  });
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────


/**
 * Fetch all active categories.
 * @param {Object} [params]
 * @param {boolean} [params.all] - Admin: include inactive categories
 */
export async function getCategories(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/categories${query}`);
}

/**
 * Get a single category by MongoDB _id or slug.
 * @param {string} id
 */
export async function getCategoryById(id) {
  return request(`/categories/${id}`);
}

/**
 * Create a category (Admin only).
 * @param {Object} data - { name, description, image }
 */
export async function createCategory(data) {
  return request('/categories', { method: 'POST', body: data });
}

/**
 * Update a category (Admin only).
 * @param {string} id
 * @param {Object} data
 */
export async function updateCategory(id, data) {
  return request(`/categories/${id}`, { method: 'PUT', body: data });
}

/**
 * Delete a category (Admin only).
 * @param {string} id
 */
export async function deleteCategory(id) {
  return request(`/categories/${id}`, { method: 'DELETE' });
}

// ─────────────────────────────────────────────
// Cart API
// ─────────────────────────────────────────────

/**
 * Fetch authenticated user cart from MongoDB.
 */
export async function getCartApi() {
  return request('/cart');
}

/**
 * Add item to MongoDB cart.
 * @param {string} productId
 * @param {number} [quantity=1]
 */
export async function addToCartApi(productId, quantity = 1) {
  return request('/cart', {
    method: 'POST',
    body: { productId, quantity }
  });
}

/**
 * Update item quantity in MongoDB cart.
 * @param {string} productId
 * @param {number} quantity
 */
export async function updateCartItemApi(productId, quantity) {
  return request(`/cart/${productId}`, {
    method: 'PUT',
    body: { quantity }
  });
}

/**
 * Remove item from MongoDB cart.
 * @param {string} productId
 */
export async function removeFromCartApi(productId) {
  return request(`/cart/${productId}`, {
    method: 'DELETE'
  });
}

/**
 * Clear MongoDB cart.
 */
export async function clearCartApi() {
  return request('/cart', {
    method: 'DELETE'
  });
}

/**
 * Sync guest cart items to MongoDB.
 * @param {Array} cartItems - [{ productId, quantity }]
 */
export async function syncCartApi(cartItems) {
  return request('/cart/sync', {
    method: 'POST',
    body: { cartItems }
  });
}

// ─────────────────────────────────────────────
// Wishlist API
// ─────────────────────────────────────────────

/**
 * Fetch authenticated user wishlist from MongoDB.
 */
export async function getWishlistApi() {
  return request('/wishlist');
}

/**
 * Add product to MongoDB wishlist.
 * @param {string} productId
 */
export async function addToWishlistApi(productId) {
  return request('/wishlist', {
    method: 'POST',
    body: { productId }
  });
}

/**
 * Remove product from MongoDB wishlist.
 * @param {string} productId
 */
export async function removeFromWishlistApi(productId) {
  return request(`/wishlist/${productId}`, {
    method: 'DELETE'
  });
}

/**
 * Move product from wishlist to cart in MongoDB.
 * @param {string} productId
 * @param {number} [quantity=1]
 */
export async function moveToCartApi(productId, quantity = 1) {
  return request('/wishlist/move-to-cart', {
    method: 'POST',
    body: { productId, quantity }
  });
}

/**
 * Sync guest wishlist items to MongoDB.
 * @param {Array} productIds - [productId]
 */
export async function syncWishlistApi(productIds) {
  return request('/wishlist/sync', {
    method: 'POST',
    body: { productIds }
  });
}

// ─────────────────────────────────────────────
// Orders API
// ─────────────────────────────────────────────

/**
 * Place a new order.
 * @param {Object} orderData - { orderItems, shippingAddress, paymentMethod }
 */
export async function createOrderApi(orderData) {
  return request('/orders', {
    method: 'POST',
    body: orderData
  });
}

/**
 * Fetch orders placed by the current authenticated user.
 */
export async function getMyOrdersApi() {
  return request('/orders/myorders');
}

/**
 * Fetch a single order by ID.
 * @param {string} id
 */
export async function getOrderByIdApi(id) {
  return request(`/orders/${id}`);
}

/**
 * Fetch all orders (Admin only).
 * @param {Object} [params] - { status, search }
 */
export async function getAllOrdersApi(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/orders${query}`);
}

/**
 * Update order status (Admin only).
 * @param {string} id
 * @param {string} status
 */
export async function updateOrderStatusApi(id, status) {
  return request(`/orders/${id}/status`, {
    method: 'PUT',
    body: { status }
  });
}

// ─────────────────────────────────────────────
// Coupons API
// ─────────────────────────────────────────────

/** Validate coupon for customer */
export async function validateCouponApi(code, itemsPrice) {
  return request('/coupons/validate', {
    method: 'POST',
    body: { code, itemsPrice }
  });
}

/** Get all coupons (Admin) */
export async function getCouponsApi() {
  return request('/coupons');
}

/** Create coupon (Admin) */
export async function createCouponApi(data) {
  return request('/coupons', {
    method: 'POST',
    body: data
  });
}

/** Update coupon (Admin) */
export async function updateCouponApi(id, data) {
  return request(`/coupons/${id}`, {
    method: 'PUT',
    body: data
  });
}

/** Toggle coupon active state (Admin) */
export async function toggleCouponApi(id) {
  return request(`/coupons/${id}/toggle`, {
    method: 'PATCH'
  });
}

/** Delete coupon (Admin) */
export async function deleteCouponApi(id) {
  return request(`/coupons/${id}`, {
    method: 'DELETE'
  });
}

// ─────────────────────────────────────────────
// Reviews API
// ─────────────────────────────────────────────

/** Get product reviews (Public) */
export async function getProductReviewsApi(productId) {
  return request(`/products/${productId}/reviews`);
}

/** Check review eligibility for logged in customer */
export async function checkReviewEligibilityApi(productId) {
  return request(`/products/${productId}/review-eligibility`);
}

/** Create or update review for product (Customer) */
export async function createReviewApi(productId, data) {
  return request(`/products/${productId}/reviews`, {
    method: 'POST',
    body: data
  });
}

/** Get all reviews across products (Admin) */
export async function getAllReviewsApi() {
  return request('/reviews');
}

/** Toggle review approval status (Admin) */
export async function approveReviewApi(id, isApproved) {
  return request(`/reviews/${id}/approve`, {
    method: 'PUT',
    body: { isApproved }
  });
}

/** Delete a review (Admin or Owner) */
export async function deleteReviewApi(id) {
  return request(`/reviews/${id}`, {
    method: 'DELETE'
  });
}

// ─────────────────────────────────────────────
// Profile / Account API
// ─────────────────────────────────────────────

/**
 * Update authenticated user profile (name, phone, addresses, password)
 * @param {Object} data
 */
export async function updateUserProfileApi(data) {
  return request('/users/profile', {
    method: 'PUT',
    body: data
  });
}

// ─────────────────────────────────────────────
// Admin Notifications API
// ─────────────────────────────────────────────

/**
 * Fetch paginated admin notifications
 * @param {Object} [params] - { page, limit, status }
 */
export async function getNotificationsApi(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return request(`/notifications${query}`);
}

/**
 * Get count of unread admin notifications
 */
export async function getUnreadCountApi() {
  return request('/notifications/unread-count');
}

/**
 * Mark a single notification as read
 * @param {string} id
 */
export async function markNotificationReadApi(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PUT'
  });
}

/**
 * Mark all admin notifications as read
 */
export async function markAllNotificationsReadApi() {
  return request('/notifications/mark-all-read', {
    method: 'PUT'
  });
}

/**
 * Delete a notification
 * @param {string} id
 */
export async function deleteNotificationApi(id) {
  return request(`/notifications/${id}`, {
    method: 'DELETE'
  });
}

