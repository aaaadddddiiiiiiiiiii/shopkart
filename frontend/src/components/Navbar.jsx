import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { logoutCustomer } from '../services/api';

function Navbar({ customerName }) {
  const navigate = useNavigate();
  const { cartCount, refreshCart } = useCart();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await logoutCustomer();
    } catch {
      // Even if the request fails, drop the client-side session and
      // send the user back to login — the cookie will simply expire.
    } finally {
      // Reload cart state so nothing from this session lingers
      refreshCart();
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="border-b border-[var(--sk-line)] bg-[var(--sk-paper)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-semibold text-[var(--sk-moss-dark)]">
            ShopKart
          </span>
          <nav className="flex gap-4 text-sm font-medium text-[var(--sk-ink)]/70">
            <Link to="/home" className="hover:text-[var(--sk-moss-dark)]">
              Home
            </Link>
            <Link to="/products" className="hover:text-[var(--sk-moss-dark)]">
              Products
            </Link>
            <Link to="/wishlist" className="hover:text-[var(--sk-moss-dark)]">
              Wishlist
            </Link>
            <Link to="/cart" className="hover:text-[var(--sk-moss-dark)]">
              Cart ({cartCount})
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {customerName && (
            <span className="hidden text-sm text-[var(--sk-ink)]/70 sm:inline">
              {customerName}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="rounded-md border border-[var(--sk-moss-dark)] px-3 py-1.5 text-sm font-medium text-[var(--sk-moss-dark)] transition hover:bg-[var(--sk-moss-dark)] hover:text-white disabled:opacity-50"
          >
            {pending ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
