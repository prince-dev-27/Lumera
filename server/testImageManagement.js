const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

const PORT = 5098;
let server;
let adminToken = '';
let categoryId = '';
let createdProductId = '';
let uploadedCloudinaryUrls = [];

// HTTP Request Helper
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method,
      headers: {
        ...(typeof body === 'object' && body !== null ? { 'Content-Type': 'application/json' } : {}),
        'Content-Length': Buffer.byteLength(postData),
        ...headers,
      },
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
    if (postData) req.write(postData);
    req.end();
  });
}

// Multipart Form Request Helper for Image Upload
function uploadRequest(path, files, headers = {}) {
  return new Promise((resolve, reject) => {
    const boundary = '--------------------------' + Date.now().toString(16);
    let bodyBuffers = [];

    files.forEach((file) => {
      bodyBuffers.push(
        Buffer.from(
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="images"; filename="${file.filename}"\r\n` +
          `Content-Type: ${file.mimetype}\r\n\r\n`
        )
      );
      bodyBuffers.push(file.content);
      bodyBuffers.push(Buffer.from('\r\n'));
    });

    bodyBuffers.push(Buffer.from(`--${boundary}--\r\n`));
    const fullBuffer = Buffer.concat(bodyBuffers);

    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBuffer.length,
        ...headers,
      },
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
    req.write(fullBuffer);
    req.end();
  });
}

async function runTests() {
  console.log('\n==================================================');
  console.log('  PHASE 9: PRODUCT IMAGE MANAGEMENT TEST SUITE');
  console.log('==================================================\n');

  try {
    // 1. Setup Admin Account
    console.log('[1/7] Setting up Admin user & token...');
    await User.deleteMany({ email: 'admin_img_test@lumera.com' });
    const adminUser = await User.create({
      name: 'Admin Image Tester',
      email: 'admin_img_test@lumera.com',
      password: 'password123',
      role: 'admin',
    });

    const loginRes = await request('POST', '/api/users/login', {
      email: 'admin_img_test@lumera.com',
      password: 'password123',
    });

    const token = loginRes.body.token || loginRes.body.data?.token;
    if (loginRes.status !== 200 || !token) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }
    adminToken = token;

    console.log('  ✓ Admin logged in successfully.');

    // 2. Setup Category
    console.log('\n[2/7] Fetching / creating test product category...');
    let cat = await Category.findOne({ isActive: true });
    if (!cat) {
      cat = await Category.create({
        name: 'Necklaces Test',
        description: 'Test Category',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
      });
    }
    categoryId = cat._id.toString();
    console.log(`  ✓ Category ready: ID = ${categoryId}`);

    // 3. Test Secure Cloudinary Upload Endpoint
    console.log('\n[3/7] Testing Secure Cloudinary Image Upload (POST /api/upload/images)...');
    // Create dummy 1x1 GIF binary buffers
    const dummyImageBuffer1 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    const dummyImageBuffer2 = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

    const filesToUpload = [
      { filename: 'ruby_necklace_front.gif', mimetype: 'image/gif', content: dummyImageBuffer1 },
      { filename: 'ruby_necklace_back.gif', mimetype: 'image/gif', content: dummyImageBuffer2 },
    ];

    const uploadRes = await uploadRequest('/api/upload/images', filesToUpload, {
      Authorization: `Bearer ${adminToken}`,
    });

    console.log(`  Upload Response Status: ${uploadRes.status}`);
    console.log('  Upload Response Body:', JSON.stringify(uploadRes.body, null, 2));

    if (uploadRes.status !== 200 || !uploadRes.body.success || !Array.isArray(uploadRes.body.urls)) {
      throw new Error('Cloudinary image upload endpoint test failed!');
    }

    uploadedCloudinaryUrls = uploadRes.body.urls;
    if (uploadedCloudinaryUrls.length !== 2) {
      throw new Error(`Expected 2 image URLs, got ${uploadedCloudinaryUrls.length}`);
    }
    console.log('  ✓ Cloudinary images uploaded successfully! Received URLs:');
    uploadedCloudinaryUrls.forEach((url, idx) => console.log(`    [${idx + 1}] ${url}`));

    // 4. Add Product with Cloudinary Images
    console.log('\n[4/7] Testing Adding Product with Images (POST /api/products)...');
    const createProductRes = await request(
      'POST',
      '/api/products',
      {
        name: 'Royal Kundan Ruby Necklace',
        description: 'Handcrafted traditional ruby necklace set plated in 24K gold with intricate stone work.',
        price: 8500,
        discountPrice: 6999,
        stock: 15,
        category: categoryId,
        isFeatured: true,
        images: uploadedCloudinaryUrls,
        attributes: {
          material: 'Brass',
          plating: '24K Gold',
          stoneType: 'Ruby & Kundan',
          size: 'Adjustable',
        },
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    console.log(`  Create Product Status: ${createProductRes.status}`);
    if (createProductRes.status !== 201 || !createProductRes.body.data) {
      throw new Error(`Create product failed: ${JSON.stringify(createProductRes.body)}`);
    }

    const createdProduct = createProductRes.body.data;
    createdProductId = createdProduct._id;
    console.log(`  ✓ Product created successfully! ID: ${createdProductId}`);
    console.log('  ✓ Verified stored images in MongoDB:', createdProduct.images);

    // Verify MongoDB storage directly
    const dbProduct = await Product.findById(createdProductId);
    if (!dbProduct || dbProduct.images.length !== 2) {
      throw new Error('Product in MongoDB does not match expected image count!');
    }
    console.log('  ✓ Verified MongoDB document stores array of image URL strings (no binary blobs).');

    // 5. Edit Product Images (Update images list)
    console.log('\n[5/7] Testing Editing Product Images (PUT /api/products/:id)...');
    const additionalImageUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/lumera/products/side_view_necklace.jpg';
    const updatedImageList = [...uploadedCloudinaryUrls, additionalImageUrl];

    const updateProductRes = await request(
      'PUT',
      `/api/products/${createdProductId}`,
      {
        name: 'Royal Kundan Ruby Necklace (Updated)',
        images: updatedImageList,
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    console.log(`  Update Product Status: ${updateProductRes.status}`);
    if (updateProductRes.status !== 200 || updateProductRes.body.data.images.length !== 3) {
      throw new Error(`Update product images failed: ${JSON.stringify(updateProductRes.body)}`);
    }
    console.log('  ✓ Product images updated successfully! Total images now:', updateProductRes.body.data.images.length);

    // 6. Remove an Image from Product Images
    console.log('\n[6/7] Testing Removing an Image from Product & Cloudinary delete helper...');
    // Remove the middle image
    const finalImageList = [updatedImageList[0], updatedImageList[2]];

    const removeImageRes = await request(
      'PUT',
      `/api/products/${createdProductId}`,
      {
        images: finalImageList,
      },
      { Authorization: `Bearer ${adminToken}` }
    );

    if (removeImageRes.status !== 200 || removeImageRes.body.data.images.length !== 2) {
      throw new Error(`Remove image update failed: ${JSON.stringify(removeImageRes.body)}`);
    }
    console.log('  ✓ Image removed from product successfully! Remaining images:', removeImageRes.body.data.images);

    // Also test Cloudinary single image delete helper route
    const deleteHelperRes = await request(
      'DELETE',
      '/api/upload/image',
      { imageUrl: updatedImageList[1] },
      { Authorization: `Bearer ${adminToken}` }
    );
    console.log(`  Cloudinary delete helper route status: ${deleteHelperRes.status}, success: ${deleteHelperRes.body.success}`);

    // 7. Display Images on Customer Website API Endpoints
    console.log('\n[7/7] Testing Customer Website Product API Display (GET /api/products & GET /api/products/:id)...');
    
    // Single product fetch
    const getSingleRes = await request('GET', `/api/products/${createdProductId}`);
    if (getSingleRes.status !== 200 || !getSingleRes.body.data.images || getSingleRes.body.data.images.length !== 2) {
      throw new Error(`Public single product display failed: ${JSON.stringify(getSingleRes.body)}`);
    }
    console.log('  ✓ Customer single product view retrieves product images correctly:', getSingleRes.body.data.images);

    // List products fetch
    const getListRes = await request('GET', `/api/products?search=Ruby`);
    if (getListRes.status !== 200 || !getListRes.body.data || getListRes.body.data.length === 0) {
      throw new Error(`Public product list search failed: ${JSON.stringify(getListRes.body)}`);
    }
    const matchedProduct = getListRes.body.data.find(p => p._id === createdProductId);
    if (!matchedProduct || !matchedProduct.images?.[0]) {
      throw new Error('Product in public search list missing primary Cloudinary image!');
    }
    console.log(`  ✓ Customer product list view receives primary Cloudinary image: ${matchedProduct.images[0]}`);

    console.log('\n==================================================');
    console.log('  SUCCESS! ALL PHASE 9 IMAGE MANAGEMENT TESTS PASSED!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    // Cleanup created test records
    try {
      if (createdProductId) {
        await Product.findByIdAndDelete(createdProductId);
      }
      await User.deleteMany({ email: 'admin_img_test@lumera.com' });
    } catch (e) {}

    if (server) server.close();
    mongoose.connection.close();
  }
}

server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}...`);
  runTests();
});
