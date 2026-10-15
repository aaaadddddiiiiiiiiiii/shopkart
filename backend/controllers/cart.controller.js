const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// Loads the user's cart with each Product populated and sends it back.
// Every cart API returns the cart in this same shape, so the frontend can
// simply replace its cart state with whatever the server returns.
async function sendCart(res, userId, message) {
  const user = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name price image stock'
  });

  return res.status(200).json({
    success: true,
    message,
    cart: user.cart
  });
}

// -------------------- Add product to cart --------------------
async function addToCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = req.user;
    const cartItem = user.cart.find((item) => item.product.equals(product._id));

    // Already in cart -> +1, otherwise start at 1
    const newQuantity = cartItem ? cartItem.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of ${product.name} available`
      });
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
    } else {
      user.cart.push({ product: product._id, quantity: 1 });
    }

    await user.save();

    return sendCart(res, user._id, 'Cart updated');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: err.message
    });
  }
}

// -------------------- Get current user's cart --------------------
async function getCart(req, res) {
  try {
    return sendCart(res, req.user._id);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: err.message
    });
  }
}

// -------------------- Update quantity --------------------
async function updateQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a number'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = req.user;
    const cartItem = user.cart.find((item) => item.product.equals(product._id));

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) of ${product.name} available`
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    return sendCart(res, user._id, 'Cart updated');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update quantity',
      error: err.message
    });
  }
}

// -------------------- Remove product from cart --------------------
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const user = req.user;
    const cartItem = user.cart.find((item) => item.product.equals(productId));

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart'
      });
    }

    user.cart = user.cart.filter((item) => !item.product.equals(productId));
    await user.save();

    return sendCart(res, user._id, 'Product removed from cart');
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from cart',
      error: err.message
    });
  }
}

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
};
