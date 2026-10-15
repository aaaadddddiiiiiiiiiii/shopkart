const jwt = require('jsonwebtoken');
const Customer = require('../models/customer.model');

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: no token provided'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: invalid or expired token'
      });
    }

    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: customer not found'
      });
    }

    req.user = customer;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong in authentication',
      error: err.message
    });
  }
}

module.exports = authMiddleware;
