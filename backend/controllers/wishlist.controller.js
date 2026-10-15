const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

// -------------------- Add product to wishlist --------------------
async function addToWishlist(req, res) {
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

    // req.user comes from the auth middleware (JWT cookie) — never from the body
    const user = req.user;

    const alreadySaved = user.wishlist.some((id) => id.equals(product._id));

    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(product._id);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: err.message
    });
  }
}

// -------------------- Get current user's wishlist --------------------
async function getWishlist(req, res) {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    return res.status(200).json({
      success: true,
      count: user.wishlist.length,
      wishlist: user.wishlist
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: err.message
    });
  }
}

// -------------------- Remove product from wishlist --------------------
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const user = req.user;

    const isInWishlist = user.wishlist.some((id) => id.equals(productId));

    if (!isInWishlist) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    user.wishlist = user.wishlist.filter((id) => !id.equals(productId));
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: err.message
    });
  }
}

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};
