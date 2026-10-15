import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import { getOrders } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const loadOrders = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await getOrders();
      setOrders(data.orders);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          My Orders
        </h1>

        {status === 'loading' && (
          <p className="mt-6 text-sm text-[var(--sk-ink)]/70">Loading your orders...</p>
        )}

        {status === 'error' && (
          <div className="mt-6">
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load your orders.
            </p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-4 rounded-md bg-[var(--sk-moss)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && orders.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-sm text-[var(--sk-ink)]/70">You have not placed any orders yet.</p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {status === 'ready' && orders.length > 0 && (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
