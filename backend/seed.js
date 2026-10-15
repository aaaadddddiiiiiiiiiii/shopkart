// Optional helper: populates a handful of products so the frontend
// has something to show. Run with: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const sampleProducts = [
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600',
    stock: 10
  },
  {
    name: 'Noise Cancelling Headphones',
    description: 'Wireless over-ear headphones with active noise cancellation.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    stock: 25
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with breathable mesh upper.',
    price: 1999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    stock: 40
  },
  {
    name: 'Atomic Habits',
    description: 'Bestselling book on building good habits and breaking bad ones.',
    price: 399,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    stock: 60
  },
  {
    name: 'Ceramic Coffee Mug Set',
    description: 'Set of 4 handcrafted ceramic coffee mugs.',
    price: 899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600',
    stock: 15
  },
  {
    name: 'Smartphone Stand',
    description: 'Adjustable aluminium stand for phones and tablets.',
    price: 499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1592890288564-76628a30a657?w=600',
    stock: 0
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB at', process.env.MONGO_URI);

  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);

  console.log(`Seeded ${sampleProducts.length} products`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
