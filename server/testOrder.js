const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

const PORT = 5098;
let server;
let customerToken = '';
let adminToken = '';
let testProductId = '';

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
  console.log('   PHASE 8 COMPLETE CHECKOUT & ORDER TEST SUITE    ');
  console.log('====================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  // Cleanup test data
  await User.deleteMany({ email: { $in: ['ordercustomer@lumera.com', 'orderadmin@lumera.com'] } });
  await Category.deleteMany({ name: 'Order Test Category' });
  await Product.deleteMany({ name: 'Order Test Royal Kundan Necklace' });
  await Order.deleteMany({});

  // 1. Setup Admin & Customer
  console.log('1. Registering Customer & Admin users...');
  const custRes = await request('POST', '/api/users/register', {
    name: 'Order Test Customer',
    email: 'ordercustomer@lumera.com',
    password: 'password123',
    role: 'customer'
  });
  customerToken = custRes.body.data.token;
  console.log('   ✓ Customer registered with JWT token.');

  const adminRes = await request('POST', '/api/users/register', {
    name: 'Order Test Admin',
    email: 'orderadmin@lumera.com',
    password: 'password123',
    role: 'admin'
  });
  await User.findByIdAndUpdate(adminRes.body.data._id, { role: 'admin' });
  const loginRes = await request('POST', '/api/users/login', {
    email: 'orderadmin@lumera.com',
    password: 'password123'
  });
  adminToken = loginRes.body.data.token;
  console.log('   ✓ Admin registered with JWT token.');

  // 2. Setup Category & Product
  console.log('\n2. Creating test Category & Product (Stock: 10, Price: ₹1500, DiscountPrice: ₹1200)...');
  const catRes = await request('POST', '/api/categories', {
    name: 'Order Test Category',
    description: 'Category for Order testing'
  }, { Authorization: `Bearer ${adminToken}` });
  const categoryId = catRes.body.data._id;

  const prodRes = await request('POST', '/api/products', {
    name: 'Order Test Royal Kundan Necklace',
    description: 'Exquisite Kundan craftsmanship',
    price: 1500,
    discountPrice: 1200,
    category: categoryId,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1']
  }, { Authorization: `Bearer ${adminToken}` });

  testProductId = prodRes.body.data._id;
  console.log(`   ✓ Product created. ID: ${testProductId}, Initial Stock: 10, Unit Price: ₹1200`);

  // 3. Test Invalid Stock Request (stock = 10, request = 15)
  console.log('\n3. Testing Stock Validation (Requesting 15 units when stock is 10)...');
  const invalidStockRes = await request('POST', '/api/orders', {
    orderItems: [{ product: testProductId, quantity: 15 }],
    shippingAddress: {
      fullName: 'Order Test Customer',
      phone: '9876543210',
      street: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    }
  }, { Authorization: `Bearer ${customerToken}` });

  if (invalidStockRes.status === 400) {
    console.log(`   ✓ Stock validation working correctly! Server rejected order: "${invalidStockRes.body.message}"`);
  } else {
    throw new Error(`Expected 400 Bad Request, got ${invalidStockRes.status}`);
  }

  // 4. Test Price Calculation Security (Sending fake unit price ₹10)
  console.log('\n4. Testing Price Security (Attempting frontend price tampering: unit price ₹10)...');
  const orderWithTamperedPrice = await request('POST', '/api/orders', {
    orderItems: [{ product: testProductId, quantity: 2, price: 10 }], // Fake price 10
    shippingAddress: {
      fullName: 'Order Test Customer',
      phone: '9876543210',
      street: '123 Test St',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    }
  }, { Authorization: `Bearer ${customerToken}` });

  const createdOrder = orderWithTamperedPrice.body.data;
  console.log(`   ✓ Items Price calculated by Server: ₹${createdOrder.itemsPrice} (Expected 2 * 1200 = 2400)`);
  if (createdOrder.itemsPrice === 2400) {
    console.log('   ✓ Server strictly calculated prices from database and ignored client price tampering!');
  } else {
    throw new Error(`Price tampering check failed! Items price was ${createdOrder.itemsPrice}`);
  }

  // Check stock deduction after order (10 - 2 = 8)
  const updatedProductAfterOrder = await Product.findById(testProductId);
  console.log(`   ✓ Product Stock after order: ${updatedProductAfterOrder.stock} (Reduced from 10 to 8)`);
  if (updatedProductAfterOrder.stock !== 8) {
    throw new Error(`Stock deduction failed! Expected 8, got ${updatedProductAfterOrder.stock}`);
  }

  const orderId = createdOrder._id;

  // 5. Test Fetch Customer Order History
  console.log('\n5. Testing GET Customer Order History (/api/orders/myorders)...');
  const myOrdersRes = await request('GET', '/api/orders/myorders', null, { Authorization: `Bearer ${customerToken}` });
  console.log(`   ✓ Customer fetched ${myOrdersRes.body.count} order(s). First Order ID: ${myOrdersRes.body.data[0]._id}`);

  // 6. Test Fetch Order By ID
  console.log('\n6. Testing GET Order Details By ID (/api/orders/:id)...');
  const orderDetailsRes = await request('GET', `/api/orders/${orderId}`, null, { Authorization: `Bearer ${customerToken}` });
  console.log(`   ✓ Fetched order status: ${orderDetailsRes.body.data.orderStatus}, Recipient: ${orderDetailsRes.body.data.shippingAddress.fullName}`);

  // 7. Test Admin Order List & Filtering by Status
  console.log('\n7. Testing GET Admin All Orders (/api/orders)...');
  const adminOrdersRes = await request('GET', '/api/orders', null, { Authorization: `Bearer ${adminToken}` });
  console.log(`   ✓ Admin fetched ${adminOrdersRes.body.count} total order(s).`);

  const pendingFilterRes = await request('GET', '/api/orders?status=Pending', null, { Authorization: `Bearer ${adminToken}` });
  console.log(`   ✓ Admin status filter (status=Pending) returned ${pendingFilterRes.body.count} order(s).`);

  // 8. Test Admin Updating Order Status through all 8 required statuses
  console.log('\n8. Testing Admin Order Status Transitions (Testing all 8 statuses)...');
  const statusesToTest = [
    'Confirmed',
    'Processing',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  for (const targetStatus of statusesToTest) {
    const statusUpdateRes = await request('PUT', `/api/orders/${orderId}/status`, {
      status: targetStatus
    }, { Authorization: `Bearer ${adminToken}` });

    if (statusUpdateRes.status === 200 && statusUpdateRes.body.data.orderStatus === targetStatus) {
      console.log(`   ✓ Updated status to: "${targetStatus}"`);
    } else {
      throw new Error(`Failed updating status to ${targetStatus}: ${JSON.stringify(statusUpdateRes.body)}`);
    }
  }

  // Check Restock on Cancellation (Stock should be restored from 8 back to 10!)
  const productAfterCancellation = await Product.findById(testProductId);
  console.log(`   ✓ Stock after Order Cancellation: ${productAfterCancellation.stock} (Restored from 8 back to 10!)`);
  if (productAfterCancellation.stock !== 10) {
    throw new Error(`Stock restock on cancellation failed! Expected 10, got ${productAfterCancellation.stock}`);
  }

  console.log('\n====================================================');
  console.log('   🎉 ALL PHASE 8 ORDER TESTS PASSED SUCCESSFULLY!  ');
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
