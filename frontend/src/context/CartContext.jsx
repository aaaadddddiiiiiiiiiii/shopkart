import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Loads the cart from the backend (the source of truth)
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getCart();
      setCartItems(data.cart);
    } catch {
      setCartItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Mutations: call the API, then replace the shared cart state with the
  // updated cart the server returns. Errors are thrown so the component that
  // triggered the action can show its own loading/error state.
  async function addToCart(productId) {
    const { data } = await addCartItem(productId);
    setCartItems(data.cart);
  }

  async function updateQuantity(productId, quantity) {
    const { data } = await updateCartItem(productId, quantity);
    setCartItems(data.cart);
  }

  async function removeFromCart(productId) {
    const { data } = await removeCartItem(productId);
    setCartItems(data.cart);
  }

  // Derived values — calculated from cartItems, never stored separately
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value = {
    cartItems,
    loading,
    error,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
