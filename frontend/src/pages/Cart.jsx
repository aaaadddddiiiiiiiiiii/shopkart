import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

function Cart() {
  const { cartItems, loading, error, cartCount, subtotal, refreshCart } = useCart();

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          My Cart
        </h1>

        {loading && (
          <p className="mt-6 text-sm text-[var(--sk-ink)]/70">Loading your cart...</p>
        )}

        {!loading && error && (
          <div className="mt-6">
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load your cart.
            </p>
            <button
              type="button"
              onClick={refreshCart}
              className="mt-4 rounded-md bg-[var(--sk-moss)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="mt-16 text-center">
            <p className="font-display text-lg font-semibold text-[var(--sk-ink)]">
              Your cart is empty 🛒
            </p>
            <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
              Looks like you haven't added anything yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="md:col-span-2">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-[var(--sk-line)] bg-white p-5">
              <h2 className="font-display text-lg font-semibold text-[var(--sk-ink)]">
                Order Summary
              </h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--sk-ink)]/70">Items</dt>
                  <dd className="font-medium">{cartCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--sk-ink)]/70">Subtotal</dt>
                  <dd className="font-semibold text-[var(--sk-moss-dark)]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-6 block rounded-md bg-[var(--sk-moss)] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
              >
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
