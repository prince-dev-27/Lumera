const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');

const PORT = 5099;
let server;
let customerToken = '';
let adminToken = '';

// Helper for HTTP requests
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
  console.log('--- Starting Authentication Test Suite ---');
  
  // Wait for mongoose connection
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  // Clear test users if present
  await User.deleteMany({ email: { $in: ['testcustomer@lumera.com', 'testadmin@lumera.com'] } });

  // 1. Register Customer
  console.log('\n1. Testing Customer Registration...');
  const regRes = await request('POST', '/api/users/register', {
    name: 'Test Customer',
    email: 'testcustomer@lumera.com',
    password: 'password123',
    role: 'customer'
  });
  console.log('Status:', regRes.status);
  console.log('Response:', regRes.body);
  if (regRes.status === 201 && regRes.body.success && regRes.body.data.token && regRes.body.data.role === 'customer') {
    console.log('✅ Customer Registration Passed');
  } else {
    throw new Error('❌ Customer Registration Failed');
  }

  // 2. Login Customer
  console.log('\n2. Testing Customer Login...');
  const loginRes = await request('POST', '/api/users/login', {
    email: 'testcustomer@lumera.com',
    password: 'password123'
  });
  console.log('Status:', loginRes.status);
  console.log('Response:', loginRes.body);
  if (loginRes.status === 200 && loginRes.body.success && loginRes.body.data.token) {
    customerToken = loginRes.body.data.token;
    console.log('✅ Customer Login Passed');
  } else {
    throw new Error('❌ Customer Login Failed');
  }

  // 3. Testing Invalid Login
  console.log('\n3. Testing Invalid Login (Wrong Password)...');
  const invalidLoginRes = await request('POST', '/api/users/login', {
    email: 'testcustomer@lumera.com',
    password: 'wrongpassword'
  });
  console.log('Status:', invalidLoginRes.status);
  console.log('Response:', invalidLoginRes.body);
  if (invalidLoginRes.status === 401 && !invalidLoginRes.body.success) {
    console.log('✅ Invalid Login Test Passed (Rejected with 401)');
  } else {
    throw new Error('❌ Invalid Login Test Failed');
  }

  // 4. Testing Protected Route (/api/users/profile) with Token
  console.log('\n4. Testing Protected Customer Route with Token...');
  const profileRes = await request('GET', '/api/users/profile', null, {
    Authorization: `Bearer ${customerToken}`
  });
  console.log('Status:', profileRes.status);
  console.log('Response:', profileRes.body);
  if (profileRes.status === 200 && profileRes.body.success && profileRes.body.data.email === 'testcustomer@lumera.com') {
    console.log('✅ Protected Customer Route Passed');
  } else {
    throw new Error('❌ Protected Customer Route Failed');
  }

  // 5. Testing Protected Route WITHOUT Token (Should fail with 401)
  console.log('\n5. Testing Protected Route without Token...');
  const noTokenRes = await request('GET', '/api/users/profile');
  console.log('Status:', noTokenRes.status);
  if (noTokenRes.status === 401) {
    console.log('✅ Unauthenticated Route Access Blocked Passed');
  } else {
    throw new Error('❌ Unauthenticated Route Access Blocked Failed');
  }

  // 6. Testing Admin Registration & Admin Route Access
  console.log('\n6. Registering Admin User...');
  const adminRegRes = await request('POST', '/api/users/register', {
    name: 'Test Admin',
    email: 'testadmin@lumera.com',
    password: 'adminpassword123',
    role: 'admin'
  });
  await User.findByIdAndUpdate(adminRegRes.body.data._id, { role: 'admin' });
  const adminLoginRes = await request('POST', '/api/users/login', {
    email: 'testadmin@lumera.com',
    password: 'adminpassword123'
  });
  adminToken = adminLoginRes.body.data.token;
  console.log('Admin Token acquired.');

  console.log('\n7. Testing Customer Access to Admin-Only Route (Should fail with 403)...');
  const customerAdminAccessRes = await request('GET', '/api/users', null, {
    Authorization: `Bearer ${customerToken}`
  });
  console.log('Status:', customerAdminAccessRes.status);
  if (customerAdminAccessRes.status === 403) {
    console.log('✅ Customer Access to Admin-Only Route Denied (403) Passed');
  } else {
    throw new Error('❌ Customer Access to Admin-Only Route Denied Failed');
  }

  console.log('\n8. Testing Admin Access to Admin-Only Route (Should succeed with 200)...');
  const adminAccessRes = await request('GET', '/api/users', null, {
    Authorization: `Bearer ${adminToken}`
  });
  console.log('Status:', adminAccessRes.status);
  console.log('Users Count:', adminAccessRes.body.count);
  if (adminAccessRes.status === 200 && adminAccessRes.body.success && Array.isArray(adminAccessRes.body.data)) {
    console.log('✅ Admin Access to Admin-Only Route Passed');
  } else {
    throw new Error('❌ Admin Access to Admin-Only Route Failed');
  }

  console.log('\n=============================================');
  console.log('🎉 ALL AUTHENTICATION BACKEND TESTS PASSED SUCCESSFULY!');
  console.log('=============================================');
}

server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Test Execution Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
});
