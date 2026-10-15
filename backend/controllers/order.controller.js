const crypto = require('crypto');
const mongoose = require('mongoose');
const razorpay = require('../config/razorpay');
const Customer = require('../models/customer.model');
const Order = require('../models/order.model');

const PHONE_REGEX = /^\d{10}$/;
const PINCODE_REGEX = /^\d{6}$/;

const ADDRESS_FIELDS = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];

// Returns an error message if the shipping address is invalid, otherwise null
function validateShippingAddress(address) {
  if (!address || typeof address !== 'object') {
    return 'Shipping address is required';
  }

  for (const field of ADDRESS_FIELDS) {
    if (typeof address[field] !== 'string' || !address[field].trim()) {
      return `${field} is required`;
    }
  }

  if (!PHONE_REGEX.test(address.phone.trim())) {
    return 'Phone number must contain 10 digits';
  }

  if (!PINCODE_REGEX.test(address.pincode.trim())) {
    return 'Pincode must contain 6 digits';
  }

  return null;
}

// -------------------- Create payment order --------------------
// Validates the cart, creates a PENDING ShopKart order and a Razorpay order.
// The cart is NOT touched here — it is only cleared after payment is verified.
async function createPaymentOrder(req, res) {
  try {
    // Only the shipping address is read from the body. Any total / items /
    // prices sent by the frontend are ignored.
    const { shippingAddress } = req.body;

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({
        success: false,
        message: addressError
      });
    }

    // Load the user's cart with the LATEST product data
    const user = await Customer.findById(req.user._id).populate('cart.product');

    if (user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      const product = cartItem.product;

      // populate() gives null if the product was deleted after being added
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available'
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`
        });
      }

      // Snapshot of the product at purchase time
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      // Total is calculated on the server from current prices
      totalAmount += product.price * cartItem.quantity;
    }

    const order = await Order.create({
      user: user._id,
      items,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount
      // paymentStatus: PENDING and status: PENDING_PAYMENT come from schema defaults
    });

    // Razorpay expects the amount in paise (₹1 = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: order._id.toString()
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID // Key ID is safe to share; the secret is not
    });
  } catch (err) {
    // Razorpay SDK errors are plain objects: { statusCode, error: { description } }
    const reason = (err.error && err.error.description) || err.message;

    return res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: reason
    });
  }
}

// -------------------- Verify payment --------------------
async function verifyPayment(req, res) {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Only the owner's order can be verified
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Use the Razorpay order id stored in OUR database (not the one sent by
    // the browser) to rebuild the signature.
    const body = order.razorpayOrderId + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Order stays PENDING and the cart is left untouched
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Cart is cleared only after the payment is verified
    const user = await Customer.findById(req.user._id);
    user.cart = [];
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Payment verified. Order placed.',
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: err.message
    });
  }
}

// -------------------- Get current user's orders --------------------
async function getOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: err.message
    });
  }
}

// -------------------- Get one order --------------------
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    // Filtering by user too means someone else's order looks like "not found"
    const order = await Order.findOne({ _id: id, user: req.user._id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: err.message
    });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
};
