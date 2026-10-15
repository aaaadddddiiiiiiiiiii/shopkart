const express = require('express');
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById
} = require('../controllers/order.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// Every order route is protected
router.use(authMiddleware);

router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getOrders);
router.get('/:id', getOrderById);

module.exports = router;
