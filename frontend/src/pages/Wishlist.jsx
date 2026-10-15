import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import { getWishlist } from '../services/api';

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const loadWishlist = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await getWishlist();
      setWishlist(data.wishlist);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Called by a card after the backend confirmed the removal
  function handleRemoved(productId) {
    setWishlist((prev) => prev.filter((product) => product._id !== productId));
  }

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          My Wishlist
        </h1>

        {status === 'loading' && (
          <p className="mt-6 text-sm text-[var(--sk-ink)]/70">Loading your wishlist...</p>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load wishlist.
            </p>
            <button
              type="button"
              onClick={loadWishlist}
              className="mt-4 rounded-md bg-[var(--sk-moss)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && wishlist.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-4xl">❤️</p>
            <p className="mt-4 font-display text-lg font-semibold text-[var(--sk-ink)]">
              Your wishlist is empty ❤️
            </p>
            <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
              Start saving products you love.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Browse Products
            </Link>
          </div>
        )}

        {status === 'ready' && wishlist.length > 0 && (
          <>
            <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
              {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <WishlistCard key={product._id} product={product} onRemoved={handleRemoved} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
