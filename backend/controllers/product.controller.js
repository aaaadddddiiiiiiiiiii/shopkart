const mongoose = require('mongoose');
const Product = require('../models/product.model');

// -------------------- Create Product --------------------
async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'name, description, category and image are required'
      });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'price must be a number greater than 0'
      });
    }

    if (stock === undefined || stock === null || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'stock must be a number of 0 or more'
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: err.message
    });
  }
}

// -------------------- Get All Products (search + category + sort) --------------------
async function getAllProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    if (search) {
      // Case-insensitive match on name
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    let cursor = Product.find(query).select('-description');

    if (sort === 'price_asc') {
      cursor = cursor.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      cursor = cursor.sort({ price: -1 });
    } else {
      cursor = cursor.sort({ createdAt: -1 });
    }

    const products = await cursor;

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: err.message
    });
  }
}

// -------------------- Get Single Product --------------------
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: err.message
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById
};
