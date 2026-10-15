const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart
} = require('../controllers/cart.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// Every cart route is protected
router.use(authMiddleware);

router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
