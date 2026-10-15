import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { addWishlistItem } from '../services/api';

function ProductCard({ product }) {
  const inStock = product.stock > 0;
  const { addToCart } = useCart();

  // Wishlist button: 'idle' | 'saving' | 'saved'
  const [wishlistState, setWishlistState] = useState('idle');
  const [wishlistError, setWishlistError] = useState('');

  // Cart button
  const [adding, setAdding] = useState(false);
  const [cartError, setCartError] = useState('');

  async function handleAddToWishlist() {
    if (wishlistState !== 'idle') return; // block duplicate clicks
    setWishlistState('saving');
    setWishlistError('');
    try {
      await addWishlistItem(product._id);
      setWishlistState('saved');
    } catch (err) {
      setWishlistState('idle');
      setWishlistError(
        err.response?.status === 409
          ? 'Already in your wishlist.'
          : 'Unable to save product. Please try again.'
      );
    }
  }

  async function handleAddToCart() {
    setAdding(true);
    setCartError('');
    try {
      await addToCart(product._id);
    } catch (err) {
      setCartError(err.response?.data?.message || 'Unable to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--sk-line)] bg-white">
      <div className="aspect-square w-full overflow-hidden bg-[var(--sk-paper)]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--sk-clay)]">
          {product.category}
        </span>
        <h3 className="font-display text-base font-semibold text-[var(--sk-ink)]">
          {product.name}
        </h3>
        <p className="mt-1 text-lg font-semibold text-[var(--sk-moss-dark)]">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
        <p className={`text-xs ${inStock ? 'text-[var(--sk-ink)]/60' : 'text-red-600'}`}>
          {inStock ? `${product.stock} units left` : 'Out of stock'}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="mt-3 rounded-md border border-[var(--sk-moss-dark)] py-2 text-center text-sm font-medium text-[var(--sk-moss-dark)] transition hover:bg-[var(--sk-moss-dark)] hover:text-white"
        >
          View Details
        </Link>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToWishlist}
            disabled={wishlistState !== 'idle'}
            className="rounded-md border border-[var(--sk-line)] py-2 text-sm font-medium text-[var(--sk-ink)] transition hover:border-[var(--sk-clay)] disabled:opacity-70"
          >
            {wishlistState === 'idle' && '♡ Add to Wishlist'}
            {wishlistState === 'saving' && '⏳ Saving...'}
            {wishlistState === 'saved' && '♥ Added to Wishlist'}
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="rounded-md bg-[var(--sk-moss)] py-2 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)] disabled:opacity-60"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>

        {wishlistError && <p className="mt-1 text-xs text-red-600">{wishlistError}</p>}
        {cartError && <p className="mt-1 text-xs text-red-600">{cartError}</p>}
      </div>
    </div>
  );
}

export default ProductCard;
