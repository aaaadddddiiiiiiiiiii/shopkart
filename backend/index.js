require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3000 || 4000;

// Frontend runs on a different port (Vite dev server), so the browser
// treats it as a different origin. credentials: true is required or the
// HttpOnly "token" cookie set on login will be rejected by the browser.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('ShopKart Auth Service is running');
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

async function start() {
  try {
    // Uses a real local (or Atlas) MongoDB instead of the in-memory
    // server — mongodb-memory-server needs to download a MongoDB
    // binary on first run, which can fail on some networks/machines.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB at', process.env.MONGO_URI);

    app.listen(PORT, () => {
      console.log(`ShopKart Auth Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();