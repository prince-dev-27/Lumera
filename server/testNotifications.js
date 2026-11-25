const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const Notification = require('./models/Notification');
const { initSocket } = require('./config/socket');

const PORT = 5099;
let server;
let customerToken = '';
let customerId = '';
let adminToken = '';
let adminId = '';
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

async function runNotificationTests() {
  console.log('========================================================');
  console.log('   NEW ORDER NOTIFICATION SYSTEM COMPLETE TEST SUITE    ');
  console.log('========================================================\n');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  // Cleanup test notifications & orders
  await Notification.deleteMany({});
  await Order.deleteMany({ 'shippingAddress.fullName': 'Notification Test Customer' });
  await User.deleteMany({ email: { $in: ['notif_cust@example.com', 'notif_admin@example.com'] } });
  await Product.deleteMany({ name: 'Notification Pearl Choker' });
  await Category.deleteMany({ name: 'Notification Jewellery' });

  // 1. Create Test Category & Product
  const testCategory = await Category.create({
    name: 'Notification Jewellery',
    description: 'Jewellery for testing notification system'
  });

  const testProduct = await Product.create({
    name: 'Notification Pearl Choker',
    description: 'Exquisite artificial pearl choker necklace for notifications test',
    price: 1800,
    discountPrice: 1500,
    stock: 25,
    category: testCategory._id,
    SKU: 'NOTIF-JWL-01',
    isActive: true
  });
  testProductId = testProduct._id.toString();

  // 2. Register Test Customer & Test Admin
  console.log('Step 1: Setting up Customer and Admin accounts...');
  const regCustRes = await request('POST', '/api/users/register', {
    name: 'Notification Test Customer',
    email: 'notif_cust@example.com',
    password: 'Password123!',
    role: 'customer'
  });
  customerToken = regCustRes.body.data.token;
  customerId = regCustRes.body.data._id;

  const regAdminRes = await request('POST', '/api/users/register', {
    name: 'Notification System Admin',
    email: 'notif_admin@example.com',
    password: 'AdminPassword123!',
    role: 'admin'
  });
  customerToken = regCustRes.body.data.token;
  customerId = regCustRes.body.data._id;
  adminId = regAdminRes.body.data._id;

  // Promote admin in database
  await User.findByIdAndUpdate(adminId, { role: 'admin' });

  // Login as admin to get refreshed token with admin role
  const adminLoginRes = await request('POST', '/api/users/login', {
    email: 'notif_admin@example.com',
    password: 'AdminPassword123!'
  });
  adminToken = adminLoginRes.body.data.token;

  console.log('✓ Accounts successfully registered & Admin promoted.\n');

  // 3. Security: Check that customer CANNOT access admin notification endpoints
  console.log('Step 2: Testing Security & Authorization guards...');
  const unauthRes = await request('GET', '/api/notifications');
  if (unauthRes.status === 401) {
    console.log('✓ Unauthenticated request to /api/notifications rejected with 401.');
  } else {
    throw new Error(`Expected 401 for unauth request, got ${unauthRes.status}`);
  }

  const custForbiddenRes = await request('GET', '/api/notifications', null, {
    Authorization: `Bearer ${customerToken}`
  });
  if (custForbiddenRes.status === 403) {
    console.log('✓ Customer request to /api/notifications rejected with 403 Forbidden.');
  } else {
    throw new Error(`Expected 403 for customer request, got ${custForbiddenRes.status}`);
  }

  // 4. Initial unread count should be 0
  console.log('\nStep 3: Checking initial notification count for admin...');
  const initialCountRes = await request('GET', '/api/notifications/unread-count', null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (initialCountRes.status === 200 && initialCountRes.body.unreadCount === 0) {
    console.log('✓ Initial unread notifications count is 0.');
  } else {
    throw new Error(`Expected initial unreadCount 0, got ${JSON.stringify(initialCountRes.body)}`);
  }

  // 5. Customer places an order
  console.log('\nStep 4: Customer places a valid order...');
  const orderRes = await request(
    'POST',
    '/api/orders',
    {
      orderItems: [
        {
          product: testProductId,
          quantity: 2
        }
      ],
      shippingAddress: {
        fullName: 'Notification Test Customer',
        phone: '9876543210',
        street: '42 Royal Palace Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        country: 'India'
      },
      paymentMethod: 'Cash on Delivery'
    },
    {
      Authorization: `Bearer ${customerToken}`
    }
  );

  if (orderRes.status !== 201 || !orderRes.body.success) {
    throw new Error(`Failed to place order: ${JSON.stringify(orderRes.body)}`);
  }
  const createdOrderId = orderRes.body.data._id;
  const createdOrderTotal = orderRes.body.data.totalPrice;
  console.log(`✓ Order placed successfully! ID: #${createdOrderId}, Total: ₹${createdOrderTotal}`);

  // 6. Verify notification was created in MongoDB
  console.log('\nStep 5: Verifying notification created in database...');
  const notifInDb = await Notification.findOne({ orderId: createdOrderId });
  if (!notifInDb) {
    throw new Error('Notification was not created in database for the new order!');
  }
  console.log(`✓ Notification in MongoDB verified:`);
  console.log(`  - Type: ${notifInDb.type}`);
  console.log(`  - Message: "${notifInDb.message}"`);
  console.log(`  - Customer: ${notifInDb.orderData?.customerName}`);
  console.log(`  - Amount: ₹${notifInDb.orderData?.totalAmount}`);
  console.log(`  - IsRead: ${notifInDb.isRead}`);

  // 7. Verify admin unread count is now 1
  console.log('\nStep 6: Verifying updated unread count for admin...');
  const updatedCountRes = await request('GET', '/api/notifications/unread-count', null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (updatedCountRes.status === 200 && updatedCountRes.body.unreadCount === 1) {
    console.log('✓ Unread count updated to 1.');
  } else {
    throw new Error(`Expected unreadCount 1, got ${JSON.stringify(updatedCountRes.body)}`);
  }

  // 8. Admin fetches paginated notifications
  console.log('\nStep 7: Admin fetches notifications list via API...');
  const listRes = await request('GET', '/api/notifications?page=1&limit=10', null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (
    listRes.status === 200 &&
    listRes.body.success &&
    listRes.body.data.length === 1 &&
    listRes.body.unreadCount === 1
  ) {
    console.log('✓ Admin fetched notifications list successfully.');
    console.log(`  - Total items: ${listRes.body.total}`);
    console.log(`  - First notification ID: ${listRes.body.data[0]._id}`);
  } else {
    throw new Error(`Notifications list failed: ${JSON.stringify(listRes.body)}`);
  }

  const notificationId = listRes.body.data[0]._id;

  // 9. Admin marks single notification as read
  console.log('\nStep 8: Admin marks notification as read...');
  const markReadRes = await request('PUT', `/api/notifications/${notificationId}/read`, null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (markReadRes.status === 200 && markReadRes.body.data.isRead === true) {
    console.log('✓ Notification successfully marked as read.');
    console.log(`✓ New unreadCount returned: ${markReadRes.body.unreadCount}`);
  } else {
    throw new Error(`Mark as read failed: ${JSON.stringify(markReadRes.body)}`);
  }

  // Check unread count is now 0
  const zeroCountRes = await request('GET', '/api/notifications/unread-count', null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (zeroCountRes.body.unreadCount === 0) {
    console.log('✓ Verified unread count is now 0.');
  } else {
    throw new Error(`Expected unread count 0, got ${zeroCountRes.body.unreadCount}`);
  }

  // 10. Place a second order and test "mark all as read"
  console.log('\nStep 9: Place second order & test "mark all as read"...');
  const orderRes2 = await request(
    'POST',
    '/api/orders',
    {
      orderItems: [{ product: testProductId, quantity: 1 }],
      shippingAddress: {
        fullName: 'Notification Test Customer',
        phone: '9876543210',
        street: '42 Royal Palace Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        postalCode: '302001',
        country: 'India'
      },
      paymentMethod: 'Cash on Delivery'
    },
    { Authorization: `Bearer ${customerToken}` }
  );

  if (orderRes2.status !== 201) {
    throw new Error(`Second order placement failed: ${JSON.stringify(orderRes2.body)}`);
  }

  const markAllRes = await request('PUT', '/api/notifications/mark-all-read', null, {
    Authorization: `Bearer ${adminToken}`
  });
  if (markAllRes.status === 200 && markAllRes.body.unreadCount === 0) {
    console.log('✓ "Mark all as read" successfully cleared all unread notifications!');
  } else {
    throw new Error(`Mark all read failed: ${JSON.stringify(markAllRes.body)}`);
  }

  console.log('\n========================================================');
  console.log('   ALL NOTIFICATION TESTS PASSED SUCCESSFULLY (10/10)   ');
  console.log('========================================================\n');
}

// Start temporary test server and run
server = http.createServer(app);
initSocket(server);

server.listen(PORT, async () => {
  try {
    await runNotificationTests();
  } catch (err) {
    console.error('TEST RUNNER ERROR:', err);
    process.exitCode = 1;
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      process.exit(process.exitCode || 0);
    });
  }
});
