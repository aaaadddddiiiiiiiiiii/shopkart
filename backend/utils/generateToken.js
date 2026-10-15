const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for a given customer id.
 * @param {string} customerId - MongoDB _id of the customer
 * @returns {string} signed JWT
 */
function generateToken(customerId) {
  return jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = generateToken;
