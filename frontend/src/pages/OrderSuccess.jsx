import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const loadOrder = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await getOrderById(id);
      setOrder(data.order);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-12">
        {status === 'loading' && (
          <p className="text-sm text-[var(--sk-ink)]/70">Loading your order...</p>
        )}

        {status === 'error' && (
          <div>
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load your order.
            </p>
            <button
              type="button"
              onClick={loadOrder}
              className="mt-4 rounded-md bg-[var(--sk-moss)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && order && (
          <div className="mx-auto max-w-md text-center">
            <p className="text-4xl">✅</p>
            <h1 className="mt-3 font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
              Order Placed Successfully
            </h1>

            <dl className="mt-6 space-y-3 rounded-lg border border-[var(--sk-line)] bg-white p-5 text-left text-sm">
              <div>
                <dt className="text-[var(--sk-ink)]/60">Order ID</dt>
                <dd className="break-all font-medium">{order._id}</dd>
              </div>
              <div>
                <dt className="text-[var(--sk-ink)]/60">Total</dt>
                <dd className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</dd>
              </div>
              <div>
                <dt className="text-[var(--sk-ink)]/60">Status</dt>
                <dd className="font-medium">{order.status}</dd>
              </div>
            </dl>

            <p className="mt-4 text-sm text-[var(--sk-ink)]/70">
              Your order has been saved successfully.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/orders"
                className="rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="rounded-md border border-[var(--sk-moss-dark)] px-6 py-2.5 text-sm font-medium text-[var(--sk-moss-dark)] transition hover:bg-[var(--sk-moss-dark)] hover:text-white"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderSuccess;
