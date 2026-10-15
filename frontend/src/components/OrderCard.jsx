import { Link } from 'react-router-dom';

function OrderCard({ order }) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="rounded-lg border border-[var(--sk-line)] bg-white p-5">
      <p className="break-all text-sm font-semibold text-[var(--sk-ink)]">Order #{order._id}</p>
      <p className="text-xs text-[var(--sk-ink)]/60">{date}</p>

      <ul className="mt-3 space-y-1 text-sm text-[var(--sk-ink)]/80">
        {order.items.map((item) => (
          <li key={item._id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm">
        Total:{' '}
        <span className="font-semibold text-[var(--sk-moss-dark)]">
          ₹{order.totalAmount.toLocaleString('en-IN')}
        </span>
      </p>
      <p className="text-sm">
        Status: <span className="font-medium">{order.status}</span>
      </p>

      <Link
        to={`/orders/${order._id}`}
        className="mt-4 inline-block rounded-md border border-[var(--sk-moss-dark)] px-4 py-2 text-sm font-medium text-[var(--sk-moss-dark)] transition hover:bg-[var(--sk-moss-dark)] hover:text-white"
      >
        View Details
      </Link>
    </div>
  );
}

export default OrderCard;
