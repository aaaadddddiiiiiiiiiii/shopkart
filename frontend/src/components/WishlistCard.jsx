import { useState } from 'react';
import { Link } from 'react-router-dom';
import { removeWishlistItem } from '../services/api';

function WishlistCard({ product, onRemoved }) {
  const inStock = product.stock > 0;
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  async function handleRemove() {
    setRemoving(true);
    setError('');
    try {
      await removeWishlistItem(product._id);
      onRemoved(product._id);
    } catch {
      setError('Unable to remove product. Please try again.');
      setRemoving(false);
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

        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="mt-2 rounded-md border border-[var(--sk-line)] py-2 text-sm font-medium text-[var(--sk-ink)] transition hover:border-[var(--sk-clay)] disabled:opacity-60"
        >
          {removing ? 'Removing...' : 'Remove ♥'}
        </button>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default WishlistCard;
