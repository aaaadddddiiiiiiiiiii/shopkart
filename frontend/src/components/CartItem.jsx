import { useState } from 'react';
import { useCart } from '../context/CartContext';

function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart } = useCart();

  // Loading/error state is local to this one cart row
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const lineTotal = product.price * quantity;

  return (
    <div className="flex gap-4 border-b border-[var(--sk-line)] py-5">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border border-[var(--sk-line)] bg-white">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold text-[var(--sk-ink)]">
              {product.name}
            </h3>
            <p className="text-sm text-[var(--sk-ink)]/70">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="font-semibold text-[var(--sk-moss-dark)]">
            ₹{lineTotal.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-md border border-[var(--sk-line)] bg-white">
            <button
              type="button"
              onClick={() => run(() => updateQuantity(product._id, quantity - 1))}
              disabled={busy || quantity <= 1}
              className="px-3 py-1 text-sm disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-8 text-center text-sm font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => run(() => updateQuantity(product._id, quantity + 1))}
              disabled={busy || quantity >= product.stock}
              className="px-3 py-1 text-sm disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => run(() => removeFromCart(product._id))}
            disabled={busy}
            className="text-sm font-medium text-[var(--sk-clay)] underline disabled:opacity-50"
          >
            {busy ? 'Updating...' : 'Remove'}
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default CartItem;
