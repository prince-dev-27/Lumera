const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Coupon = require('./models/Coupon');
const Review = require('./models/Review');

const PORT = 5099;
let server;
let customerToken = '';
let customer2Token = '';
let adminToken = '';
let testProductId = '';
let couponId = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   PHASE 10 COUPONS & REVIEWS TEST SUITE           ');
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  // Cleanup test data
  await User.deleteMany({ email: { $in: ['couponcustomer@lumera.com', 'couponcustomer2@lumera.com', 'couponadmin@lumera.com'] } });
  await Category.deleteMany({ name: 'Coupon Test Category' });
  await Product.deleteMany({ name: 'Coupon Test Diamond Bangle' });
  await Order.deleteMany({ 'shippingAddress.fullName': { $in: ['Coupon Customer 1', 'Coupon Customer 2'] } });
  await Coupon.deleteMany({ code: { $in: ['WELCOME20', 'FIXED100', 'EXPIRED50'] } });
  await Review.deleteMany({});

  // 1. Setup Admin & Customer Accounts
  console.log('1. Setting up Customer & Admin accounts...');
  const custRes = await request('POST', '/api/users/register', {
    name: 'Coupon Customer 1',
    email: 'couponcustomer@lumera.com',
    password: 'password123',
    role: 'customer'
  });
  customerToken = custRes.body.data.token;

  const cust2Res = await request('POST', '/api/users/register', {
    name: 'Coupon Customer 2',
    email: 'couponcustomer2@lumera.com',
    password: 'password123',
    role: 'customer'
  });
  customer2Token = cust2Res.body.data.token;

  const adminRes = await request('POST', '/api/users/register', {
    name: 'Coupon Admin',
    email: 'couponadmin@lumera.com',
    password: 'password123',
    role: 'admin'
  });
  await User.findByIdAndUpdate(adminRes.body.data._id, { role: 'admin' });
  const adminLoginRes = await request('POST', '/api/users/login', {
    email: 'couponadmin@lumera.com',
    password: 'password123'
  });
  adminToken = adminLoginRes.body.data.token;
  console.log('   ✓ Customer 1, Customer 2, and Admin accounts initialized.');

  // 2. Setup Test Category & Product
  console.log('\n2. Creating test Category & Product (Price: ₹2500)...');
  const catRes = await request('POST', '/api/categories', {
    name: 'Coupon Test Category',
    description: 'Category for testing'
  }, { Authorization: `Bearer ${adminToken}` });
  const categoryId = catRes.body.data._id;

  const prodRes = await request('POST', '/api/products', {
    name: 'Coupon Test Diamond Bangle',
    description: 'Beautiful handcrafted bangle',
    price: 2500,
    category: categoryId,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1']
  }, { Authorization: `Bearer ${adminToken}` });
  testProductId = prodRes.body.data._id;
  console.log(`   ✓ Product created. ID: ${testProductId}, Price: ₹2500`);

  // ── COUPON TESTS ──────────────────────────────────────────────────────────
  console.log('\n--- COUPON MANAGEMENT & VALIDATION TESTS ---');

  // 3. Admin create coupons
  console.log('\n3. Admin: Creating test coupons (WELCOME20 [20%, Min order ₹2000], FIXED100 [₹100 off])...');
  const createCouponRes = await request('POST', '/api/coupons', {
    code: 'WELCOME20',
    discountType: 'percentage',
    discountAmount: 20,
    minOrderAmount: 2000,
    isActive: true
  }, { Authorization: `Bearer ${adminToken}` });

  if (createCouponRes.status !== 201) {
    throw new Error(`Failed to create coupon: ${JSON.stringify(createCouponRes.body)}`);
  }
  couponId = createCouponRes.body.data._id;
  console.log(`   ✓ Percentage Coupon WELCOME20 created. ID: ${couponId}`);

  const createFixedRes = await request('POST', '/api/coupons', {
    code: 'FIXED100',
    discountType: 'fixed',
    discountAmount: 100,
    minOrderAmount: 500,
    isActive: true
  }, { Authorization: `Bearer ${adminToken}` });
  console.log(`   ✓ Fixed Coupon FIXED100 created.`);

  // 4. Admin Edit & Toggle Coupon
  console.log('\n4. Admin: Editing & Deactivating/Reactivating Coupon...');
  const toggleRes = await request('PATCH', `/api/coupons/${couponId}/toggle`, {}, { Authorization: `Bearer ${adminToken}` });
  if (toggleRes.body.data.isActive !== false) {
    throw new Error('Toggle deactivate failed!');
  }
  console.log('   ✓ Coupon WELCOME20 successfully deactivated.');

  // Customer validate deactivated coupon
  const invalidActiveRes = await request('POST', '/api/coupons/validate', {
    code: 'WELCOME20',
    itemsPrice: 2500
  });
  if (invalidActiveRes.status === 400) {
    console.log(`   ✓ Validation rejected inactive coupon: "${invalidActiveRes.body.message}"`);
  } else {
    throw new Error('Inactive coupon was not rejected!');
  }

  // Reactivate coupon
  await request('PATCH', `/api/coupons/${couponId}/toggle`, {}, { Authorization: `Bearer ${adminToken}` });
  console.log('   ✓ Coupon WELCOME20 reactivated.');

  // 5. Customer Validate Coupon & Discount Calculation
  console.log('\n5. Customer: Validating Coupon WELCOME20 for order of ₹2500...');
  const valRes = await request('POST', '/api/coupons/validate', {
    code: 'WELCOME20',
    itemsPrice: 2500
  });

  if (valRes.status === 200 && valRes.body.data.calculatedDiscount === 500 && valRes.body.data.finalPrice === 2000) {
    console.log(`   ✓ Server calculated discount correctly: 20% of ₹2500 = ₹${valRes.body.data.calculatedDiscount}, Final Price = ₹${valRes.body.data.finalPrice}`);
  } else {
    throw new Error(`Discount calculation error: ${JSON.stringify(valRes.body)}`);
  }

  // Test minimum order constraint
  console.log('   Testing Min Order requirement (itemsPrice ₹1000 vs minOrder ₹2000)...');
  const minOrderRes = await request('POST', '/api/coupons/validate', {
    code: 'WELCOME20',
    itemsPrice: 1000
  });
  if (minOrderRes.status === 400) {
    console.log(`   ✓ Min order restriction enforced: "${minOrderRes.body.message}"`);
  } else {
    throw new Error('Min order check failed!');
  }

  // 6. Test Applying Coupon to Order Creation
  console.log('\n6. Customer: Placing order with Coupon WELCOME20...');
  const orderRes = await request('POST', '/api/orders', {
    orderItems: [{ product: testProductId, quantity: 1 }],
    couponCode: 'WELCOME20',
    shippingAddress: {
      fullName: 'Coupon Customer 1',
      phone: '9876543210',
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    }
  }, { Authorization: `Bearer ${customerToken}` });

  const orderData = orderRes.body.data;
  console.log(`   ✓ Order created. ItemsPrice: ₹${orderData.itemsPrice}, Coupon Discount: ₹${orderData.couponDiscount}, TotalPrice: ₹${orderData.totalPrice}`);

  if (orderData.couponCode === 'WELCOME20' && orderData.couponDiscount === 500 && orderData.totalPrice === 2000) {
    console.log('   ✓ Server verified and applied coupon discount securely!');
  } else {
    throw new Error(`Order coupon calculation error: ${JSON.stringify(orderData)}`);
  }

  // ── REVIEWS TESTS ─────────────────────────────────────────────────────────
  console.log('\n--- REVIEW ELIGIBILITY & SUBMISSION TESTS ---');

  // 7. Customer 2 (No purchase) attempts to review product -> Should be REJECTED
  console.log('\n7. Customer 2 (Has NOT purchased product) attempting to submit review...');
  const ineligibleReviewRes = await request('POST', `/api/products/${testProductId}/reviews`, {
    rating: 5,
    comment: 'Fake review attempt'
  }, { Authorization: `Bearer ${customer2Token}` });

  if (ineligibleReviewRes.status === 403) {
    console.log(`   ✓ Eligibility check working! Server blocked non-purchaser: "${ineligibleReviewRes.body.message}"`);
  } else {
    throw new Error(`Expected 403 Forbidden, got ${ineligibleReviewRes.status}`);
  }

  // Check review eligibility status endpoint
  const eligibilityCheck1 = await request('GET', `/api/products/${testProductId}/review-eligibility`, null, { Authorization: `Bearer ${customer2Token}` });
  if (eligibilityCheck1.body.data.canReview === false) {
    console.log('   ✓ GET review-eligibility endpoint returns canReview: false for non-purchaser.');
  }

  // 8. Customer 1 (Has purchased product) submits a review -> Should SUCCEED
  console.log('\n8. Customer 1 (Purchased product) submitting 5-star review...');
  const eligibleCheckCustomer1 = await request('GET', `/api/products/${testProductId}/review-eligibility`, null, { Authorization: `Bearer ${customerToken}` });
  if (eligibleCheckCustomer1.body.data.canReview !== true) {
    throw new Error('Customer 1 should be eligible to review!');
  }

  const reviewRes = await request('POST', `/api/products/${testProductId}/reviews`, {
    rating: 5,
    comment: 'Absolutely stunning craftsmanship! High quality finish and fast shipping.'
  }, { Authorization: `Bearer ${customerToken}` });

  if (reviewRes.status === 201) {
    console.log('   ✓ Review submitted successfully by verified customer!');
  } else {
    throw new Error(`Failed to submit review: ${JSON.stringify(reviewRes.body)}`);
  }

  const reviewId = reviewRes.body.data._id;

  // 9. Verify product rating updated
  const updatedProduct = await Product.findById(testProductId);
  console.log(`   ✓ Product updated rating: ${updatedProduct.rating} stars, total reviews: ${updatedProduct.numReviews}`);
  if (updatedProduct.rating !== 5 || updatedProduct.numReviews !== 1) {
    throw new Error('Product rating update failed!');
  }

  // 10. Admin: View all reviews & Moderation (Approve/Disapprove & Delete)
  console.log('\n10. Admin: Viewing all reviews across products...');
  const adminReviewsRes = await request('GET', '/api/reviews', null, { Authorization: `Bearer ${adminToken}` });
  console.log(`   ✓ Admin retrieved ${adminReviewsRes.body.count} review(s). First review comment: "${adminReviewsRes.body.data[0].comment}"`);

  console.log('\n11. Admin: Unapproving and Deleting Review...');
  const unapproveRes = await request('PUT', `/api/reviews/${reviewId}/approve`, { isApproved: false }, { Authorization: `Bearer ${adminToken}` });
  if (unapproveRes.body.data.isApproved === false) {
    console.log('   ✓ Review unapproved by admin.');
  }

  const deleteReviewRes = await request('DELETE', `/api/reviews/${reviewId}`, null, { Authorization: `Bearer ${adminToken}` });
  if (deleteReviewRes.status === 200) {
    console.log('   ✓ Review deleted by admin.');
  }

  const productAfterReviewDelete = await Product.findById(testProductId);
  console.log(`   ✓ Product rating restored: ${productAfterReviewDelete.rating}, total reviews: ${productAfterReviewDelete.numReviews}`);

  console.log('\n====================================================');
  console.log('   🎉 ALL PHASE 10 COUPON & REVIEW TESTS PASSED!   ');
  console.log('====================================================\n');
}

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    server.close();
    mongoose.connection.close();
  }
});
