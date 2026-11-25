const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });
const Product = require('./models/Product');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const products = await Product.find({});
    console.log('Total products in DB:', products.length);
    products.forEach((p, i) => {
      console.log(`[${i + 1}] ID: ${p._id} | Name: ${p.name} | Images:`, p.images);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

check();
