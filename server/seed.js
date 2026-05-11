// Run this ONCE to populate test users
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Wholesaler = require('./models/Wholesaler');
const Rider = require('./models/Rider');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const password = await bcrypt.hash('123456', 10);

  // Clear existing test users to avoid duplicates (optional)
  await User.deleteMany({ phone: '03009999999' });
  await Wholesaler.deleteMany({ phone: '03001234567' });
  await Rider.deleteMany({ phone: '03001112233' });

  // Customer
  await User.create({
    phone: '03009999999',
    password,
    name: 'Test Customer'
  });

  // Wholesaler
  const wholesaler = await Wholesaler.create({
    phone: '03001234567',
    password,
    name: 'Karachi General Store',
    address: 'Saddar, Karachi',
    location: {
      type: 'Point',
      coordinates: [67.001, 24.860]
    }
  });

  // Add a few products for this wholesaler
  const Product = require('./models/Product');
  await Product.deleteMany({}); // clear all products first (optional)
  await Product.insertMany([
    {
      wholesaler: wholesaler._id,
      name: 'Daal Chana (1kg)',
      price: 250,
      stock: 50,
      image: 'https://m.media-amazon.com/images/I/71TLPQBx+4L._AC_.jpg',
      isAvailable: true
    },
    {
      wholesaler: wholesaler._id,
      name: 'Basmati Rice (5kg)',
      price: 1200,
      stock: 30,
      image: 'https://m.media-amazon.com/images/I/61SXMS0G18L._AC_.jpg',
      isAvailable: true
    },
    {
      wholesaler: wholesaler._id,
      name: 'Cooking Oil (2L)',
      price: 550,
      stock: 40,
      image: 'https://m.media-amazon.com/images/I/51B1MEwN7RL._AC_.jpg',
      isAvailable: true
    }
  ]);

  // Rider
  await Rider.create({
    phone: '03001112233',
    password,
    name: 'Ali Rider',
    vehicleNumber: 'KHI-1234',
    isOnline: false
  });

  console.log('Seed complete! Default credentials:');
  console.log('Customer: 03009999999 / 123456');
  console.log('Wholesaler: 03001234567 / 123456');
  console.log('Rider: 03001112233 / 123456');
  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });