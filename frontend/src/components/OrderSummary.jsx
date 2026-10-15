function OrderSummary({ items, total }) {
  return (
    <div className="rounded-lg border border-[var(--sk-line)] bg-white p-5">
      <h2 className="font-display text-lg font-semibold text-[var(--sk-ink)]">Order Summary</h2>

      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.product._id} className="flex justify-between gap-4">
            <span className="text-[var(--sk-ink)]/80">
              {item.product.name} × {item.quantity}
            </span>
            <span className="font-medium">
              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-[var(--sk-line)] pt-4">
        <span className="font-semibold text-[var(--sk-ink)]">Total</span>
        <span className="font-semibold text-[var(--sk-moss-dark)]">
          ₹{total.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default OrderSummary;
