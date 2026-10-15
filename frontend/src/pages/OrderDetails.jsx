import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getOrderById } from '../services/api';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'not-found'

  const loadOrder = useCallback(async () => {
    setStatus('loading');
    try {
      const { data } = await getOrderById(id);
      setOrder(data.order);
      setStatus('ready');
    } catch (err) {
      setStatus(err.response?.status === 404 ? 'not-found' : 'error');
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link to="/orders" className="text-sm font-medium text-[var(--sk-clay)] underline">
          ← Back to My Orders
        </Link>

        {status === 'loading' && (
          <p className="mt-8 text-sm text-[var(--sk-ink)]/70">Loading order...</p>
        )}

        {status === 'not-found' && (
          <p className="mt-8 text-sm text-[var(--sk-ink)]/70">Order not found.</p>
        )}

        {status === 'error' && (
          <div className="mt-8">
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Unable to load this order.
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
          <div className="mt-6">
            <h1 className="break-all font-display text-xl font-semibold text-[var(--sk-moss-dark)]">
              Order #{order._id}
            </h1>
            <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
            <p className="mt-1 text-sm">
              Status: <span className="font-medium">{order.status}</span> · Payment:{' '}
              <span className="font-medium">{order.paymentStatus}</span>
            </p>

            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="md:col-span-2">
                {order.items.map((item) => (
                  <div key={item._id} className="flex gap-4 border-b border-[var(--sk-line)] py-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-20 rounded-md border border-[var(--sk-line)] object-cover"
                      />
                    )}
                    <div className="flex flex-1 justify-between gap-4">
                      <div>
                        <p className="font-display font-semibold text-[var(--sk-ink)]">
                          {item.name}
                        </p>
                        <p className="text-sm text-[var(--sk-ink)]/70">
                          ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[var(--sk-moss-dark)]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between py-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold text-[var(--sk-moss-dark)]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <aside className="h-fit rounded-lg border border-[var(--sk-line)] bg-white p-5 text-sm">
                <h2 className="font-display text-lg font-semibold text-[var(--sk-ink)]">
                  Shipping Address
                </h2>
                <p className="mt-3 font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="mt-1 text-[var(--sk-ink)]/70">{order.shippingAddress.phone}</p>
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderDetails;
