const Razorpay = require('razorpay');

// Test Mode keys only. The Key Secret stays on the backend — it is never
// sent to the frontend or stored in MongoDB.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = razorpay;
