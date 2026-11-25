const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

const PORT = 5098;
let server;
let userToken = '';
let userId = '';
let adminToken = '';

let product1Id = '';
let product2Id = '';
let outOfStockProductId = '';

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
  console.log('--- PHASE 7: CART + WISHLIST TEST SUITE STARTING ---');
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Setup User and Test Seed Data
    const randomEmail = `cart_tester_${Date.now()}@test.com`;
    console.log(`1. Registering test customer (${randomEmail})...`);
    const regRes = await request('POST', '/api/users/register', {
      name: 'Cart Tester',
      email: randomEmail,
      password: 'password123',
      role: 'customer'
    });

    if (regRes.status !== 201 || !regRes.body.success) {
      throw new Error(`Failed to register test user: ${JSON.stringify(regRes.body)}`);
    }
    userToken = regRes.body.data.token;
    userId = regRes.body.data._id;
    console.log('✓ Test user registered successfully.\n');

    // Create Category & Test Products directly via DB
    let category = await Category.findOne();
    if (!category) {
      category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
        description: 'Category for cart testing'
      });
    }

    const p1 = await Product.create({
      name: `Emerald Solitaire Ring ${Date.now()}`,
      description: 'Elegant emerald ring',
      price: 1500,
      discountPrice: 1200,
      stock: 5,
      category: category._id
    });
    product1Id = p1._id.toString();

    const p2 = await Product.create({
      name: `Kundan Royal Necklace ${Date.now()}`,
      description: 'Royal bridal necklace',
      price: 3500,
      stock: 2,
      category: category._id
    });
    product2Id = p2._id.toString();

    const p3 = await Product.create({
      name: `Out of Stock Bangles ${Date.now()}`,
      description: 'Handcrafted gold plated bangles',
      price: 800,
      stock: 0,
      category: category._id
    });
    outOfStockProductId = p3._id.toString();

    console.log('✓ Seeded test products:');
    console.log(`  - Product 1 (Stock: 5, Price: ₹1200): ${product1Id}`);
    console.log(`  - Product 2 (Stock: 2, Price: ₹3500): ${product2Id}`);
    console.log(`  - Product 3 (Stock: 0 - Out of Stock): ${outOfStockProductId}\n`);

    const authHeaders = { Authorization: `Bearer ${userToken}` };

    // 2. Test Empty Cart
    console.log('2. GET /api/cart - Verify initial empty cart...');
    const emptyCartRes = await request('GET', '/api/cart', null, authHeaders);
    console.log(`  Status: ${emptyCartRes.status}, Items: ${emptyCartRes.body.data?.length}`);
    if (emptyCartRes.status !== 200 || emptyCartRes.body.data.length !== 0) {
      throw new Error('Initial cart was not empty!');
    }
    console.log('✓ Cart initial state verified empty.\n');

    // 3. Add product to cart (Product 1, qty 2)
    console.log('3. POST /api/cart - Add Product 1 (qty 2)...');
    const addRes1 = await request('POST', '/api/cart', { productId: product1Id, quantity: 2 }, authHeaders);
    console.log(`  Status: ${addRes1.status}, Message: ${addRes1.body.message}`);
    if (addRes1.status !== 200 || addRes1.body.data.length !== 1) {
      throw new Error('Failed to add Product 1 to cart!');
    }
    console.log('✓ Product 1 added to cart.\n');

    // 4. Stock validation test: Add more than remaining stock (Product 1, qty 4 -> total 6 > stock 5)
    console.log('4. POST /api/cart - Stock limit check: Try adding 4 more (Total 6 > Stock 5)...');
    const exceedStockRes = await request('POST', '/api/cart', { productId: product1Id, quantity: 4 }, authHeaders);
    console.log(`  Status: ${exceedStockRes.status}, Error Message: "${exceedStockRes.body.message}"`);
    if (exceedStockRes.status !== 400 || !exceedStockRes.body.message.includes('stock')) {
      throw new Error('Expected 400 error for stock limit exceeded!');
    }
    console.log('✓ Stock limit error correctly enforced on POST /api/cart.\n');

    // 5. Out of stock test: Try adding Product 3 (Stock 0)
    console.log('5. POST /api/cart - Out of stock check: Try adding Product 3 (Stock 0)...');
    const outOfStockRes = await request('POST', '/api/cart', { productId: outOfStockProductId, quantity: 1 }, authHeaders);
    console.log(`  Status: ${outOfStockRes.status}, Error Message: "${outOfStockRes.body.message}"`);
    if (outOfStockRes.status !== 400) {
      throw new Error('Expected 400 error for adding out-of-stock product!');
    }
    console.log('✓ Out of stock error correctly enforced.\n');

    // 6. Update quantity in cart (Product 1 to qty 5)
    console.log('6. PUT /api/cart/:productId - Update Product 1 quantity to 5 (Max stock)...');
    const updateRes = await request('PUT', `/api/cart/${product1Id}`, { quantity: 5 }, authHeaders);
    console.log(`  Status: ${updateRes.status}, Qty: ${updateRes.body.data[0].quantity}`);
    if (updateRes.status !== 200 || updateRes.body.data[0].quantity !== 5) {
      throw new Error('Failed to update quantity to 5');
    }
    console.log('✓ Quantity updated to max stock (5).\n');

    // 7. Update quantity exceeding stock (Product 1 to qty 6 > stock 5)
    console.log('7. PUT /api/cart/:productId - Stock check on update: Set quantity to 6...');
    const updateExceedRes = await request('PUT', `/api/cart/${product1Id}`, { quantity: 6 }, authHeaders);
    console.log(`  Status: ${updateExceedRes.status}, Error Message: "${updateExceedRes.body.message}"`);
    if (updateExceedRes.status !== 400) {
      throw new Error('Expected 400 error when setting quantity > stock!');
    }
    console.log('✓ Stock limit enforced on quantity update.\n');

    // 8. GET /api/cart - Check subtotal calculation
    console.log('8. GET /api/cart - Check subtotal & totals calculation...');
    const getCartRes = await request('GET', '/api/cart', null, authHeaders);
    const expectedSubtotal = 1200 * 5; // 6000
    console.log(`  Subtotal: ₹${getCartRes.body.subtotal} (Expected: ₹${expectedSubtotal})`);
    if (getCartRes.body.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal mismatch! Expected ${expectedSubtotal}, got ${getCartRes.body.subtotal}`);
    }
    console.log('✓ Subtotal calculation verified.\n');

    // 9. Remove item from cart
    console.log('9. DELETE /api/cart/:productId - Remove Product 1 from cart...');
    const removeCartRes = await request('DELETE', `/api/cart/${product1Id}`, null, authHeaders);
    console.log(`  Status: ${removeCartRes.status}, Items left: ${removeCartRes.body.data.length}`);
    if (removeCartRes.status !== 200 || removeCartRes.body.data.length !== 0) {
      throw new Error('Failed to remove item from cart!');
    }
    console.log('✓ Item removed from cart.\n');

    // 10. Sync guest cart
    console.log('10. POST /api/cart/sync - Sync guest cart items...');
    const syncCartRes = await request('POST', '/api/cart/sync', {
      cartItems: [
        { productId: product1Id, quantity: 2 }
      ]
    }, authHeaders);
    console.log(`  Status: ${syncCartRes.status}, Synced items count: ${syncCartRes.body.data.length}`);
    if (syncCartRes.status !== 200 || syncCartRes.body.data.length !== 1) {
      throw new Error('Guest cart sync failed!');
    }
    console.log('✓ Guest cart items synced to MongoDB.\n');

    // 11. Wishlist: Add products
    console.log('11. POST /api/wishlist - Add Product 2 to wishlist...');
    const addWishRes = await request('POST', '/api/wishlist', { productId: product2Id }, authHeaders);
    console.log(`  Status: ${addWishRes.status}, Wishlist count: ${addWishRes.body.data?.length}`);
    if (addWishRes.status !== 200 || addWishRes.body.data?.length !== 1) {
      throw new Error('Failed to add product to wishlist!');
    }
    console.log('✓ Product added to wishlist.\n');

    // 12. Wishlist: Move to cart
    console.log('12. POST /api/wishlist/move-to-cart - Move Product 2 to cart...');
    const moveRes = await request('POST', '/api/wishlist/move-to-cart', { productId: product2Id, quantity: 1 }, authHeaders);
    console.log(`  Status: ${moveRes.status}, Message: "${moveRes.body.message || ''}"`);
    if (moveRes.status !== 200 || moveRes.body.data?.wishlist?.length !== 0) {
      throw new Error(`Failed to move product from wishlist to cart! Message: ${moveRes.body.message}`);
    }
    console.log('✓ Product successfully moved from wishlist to cart.\n');

    // 13. Wishlist: Move out-of-stock product to cart
    console.log('13. POST /api/wishlist/move-to-cart - Out of stock check on move to cart...');
    await request('POST', '/api/wishlist', { productId: outOfStockProductId }, authHeaders);
    const moveOutOfStockRes = await request('POST', '/api/wishlist/move-to-cart', { productId: outOfStockProductId }, authHeaders);
    console.log(`  Status: ${moveOutOfStockRes.status}, Message: "${moveOutOfStockRes.body.message}"`);
    if (moveOutOfStockRes.status !== 400) {
      throw new Error('Expected 400 error moving out of stock product from wishlist to cart!');
    }
    console.log('✓ Stock check correctly enforced on move to cart.\n');

    // 14. Wishlist: Remove item
    console.log('14. DELETE /api/wishlist/:productId - Remove Product 3 from wishlist...');
    const removeWishRes = await request('DELETE', `/api/wishlist/${outOfStockProductId}`, null, authHeaders);
    console.log(`  Status: ${removeWishRes.status}, Wishlist count: ${removeWishRes.body.data.length}`);
    if (removeWishRes.status !== 200 || removeWishRes.body.data.length !== 0) {
      throw new Error('Failed to remove item from wishlist!');
    }
    console.log('✓ Item removed from wishlist.\n');

    // 15. Clear entire cart
    console.log('15. DELETE /api/cart - Clear entire cart...');
    const clearCartRes = await request('DELETE', '/api/cart', null, authHeaders);
    console.log(`  Status: ${clearCartRes.status}, Cart count: ${clearCartRes.body.data.length}`);
    if (clearCartRes.status !== 200 || clearCartRes.body.data.length !== 0) {
      throw new Error('Failed to clear cart!');
    }
    console.log('✓ Entire cart cleared.\n');

    console.log('====================================================');
    console.log('🎉 ALL PHASE 7 CART & WISHLIST TESTS PASSED SUCCEED!');
    console.log('====================================================');

  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    process.exit();
  }
}

server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}...`);
  await runTests();
});
