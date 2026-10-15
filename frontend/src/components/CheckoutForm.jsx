const FIELDS = [
  { name: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
  { name: 'addressLine1', label: 'Address', type: 'text', autoComplete: 'address-line1' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
  { name: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
  { name: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code' }
];

// Presentational form — the form values and errors live in the Checkout page
function CheckoutForm({ form, errors, onChange }) {
  return (
    <div className="space-y-4">
      {FIELDS.map((field) => (
        <label key={field.name} className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--sk-ink)]">
            {field.label}
          </span>
          <input
            name={field.name}
            type={field.type}
            value={form[field.name]}
            onChange={onChange}
            autoComplete={field.autoComplete}
            aria-invalid={Boolean(errors[field.name])}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--sk-moss)] ${
              errors[field.name] ? 'border-red-400' : 'border-[var(--sk-line)]'
            }`}
          />
          {errors[field.name] && (
            <span className="mt-1 block text-xs text-red-600">{errors[field.name]}</span>
          )}
        </label>
      ))}
    </div>
  );
}

export default CheckoutForm;
