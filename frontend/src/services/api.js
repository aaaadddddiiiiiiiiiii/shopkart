import axios from 'axios';

// Base URL of the Lab 01 backend. Override at build time with
// VITE_API_BASE_URL if the backend runs somewhere other than localhost:3000.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  // Required so the browser sends/receives the HttpOnly "token" cookie
  // set by the backend on login.
  withCredentials: true,
});

export const registerCustomer = (data) => api.post('/customers/register', data);

export const loginCustomer = (data) => api.post('/customers/login', data);

export const getCurrentCustomer = () => api.get('/customers/me');

export const logoutCustomer = () => api.post('/customers/logout');

export const getProducts = (params) => api.get('/products', { params });

export const getProductById = (id) => api.get(`/products/${id}`);

// ---- Wishlist (Lab 04) ----
export const addWishlistItem = (productId) => api.post(`/wishlist/${productId}`);

export const getWishlist = () => api.get('/wishlist');

export const removeWishlistItem = (productId) => api.delete(`/wishlist/${productId}`);

// ---- Cart (Lab 05) ----
export const addCartItem = (productId) => api.post(`/cart/${productId}`);

export const getCart = () => api.get('/cart');

export const updateCartItem = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeCartItem = (productId) => api.delete(`/cart/${productId}`);

// ---- Orders (Lab 06) ----
export const createPaymentOrder = (shippingAddress) =>
  api.post('/orders/create-payment-order', { shippingAddress });

export const verifyPayment = (data) => api.post('/orders/verify-payment', data);

export const getOrders = () => api.get('/orders');

export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
