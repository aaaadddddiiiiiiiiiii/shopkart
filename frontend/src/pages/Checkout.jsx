import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';
import Navbar from '../components/Navbar';
import OrderSummary from '../components/OrderSummary';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
};

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required.';
  if (!form.city.trim()) errors.city = 'City is required.';
  if (!form.state.trim()) errors.state = 'State is required.';

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = 'Phone number must contain 10 digits.';
  }

  if (!form.pincode.trim()) {
    errors.pincode = 'Pincode is required.';
  } else if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = 'Pincode must contain 6 digits.';
  }

  return errors;
}

// Loads Razorpay's Checkout script; resolves false if it fails to load
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, subtotal, refreshCart } = useCart();

  // Checkout form state lives here, in the page that submits it
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [placing, setPlacing] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setServerError('');

    // Client-side validation — no backend call if this fails
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setPlacing(true);

    try {
      // Only the shipping address is sent. The backend recalculates items and total.
      const { data } = await createPaymentOrder(form);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setServerError('Unable to load Razorpay. Please check your connection and try again.');
        setPlacing(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,

        // Not proof of payment by itself — the backend must verify the signature
        handler: async function (response) {
          try {
            await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Backend cart is cleared now — reload shared cart state (Navbar -> Cart (0))
            navigate(`/order-success/${data.shopKartOrderId}`, { replace: true });
            refreshCart();
          } catch (err) {
            setServerError(
              err.response?.data?.message || 'Payment could not be verified. Your cart has not been cleared.'
            );
            setPlacing(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone
        },

        // Re-enable the button if the user closes the Razorpay popup
        modal: {
          ondismiss: () => setPlacing(false)
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', () => {
        setServerError('Payment failed. Your cart has not been cleared. Please try again.');
      });

      paymentObject.open();
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Something went wrong while placing your order. Please try again.'
      );
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          Checkout
        </h1>

        {loading && (
          <p className="mt-6 text-sm text-[var(--sk-ink)]/70">Loading your cart...</p>
        )}

        {!loading && cartItems.length === 0 && (
          <div className="mt-8">
            <p className="text-sm text-[var(--sk-ink)]/70">Your cart is empty.</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <form onSubmit={handlePlaceOrder} noValidate className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-[var(--sk-ink)]">
                Shipping Details
              </h2>
              <CheckoutForm form={form} errors={errors} onChange={handleChange} />
            </section>

            <section className="h-fit">
              <OrderSummary items={cartItems} total={subtotal} />

              {serverError && (
                <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={placing}
                className="mt-4 w-full rounded-md bg-[var(--sk-moss)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)] disabled:opacity-50"
              >
                {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </section>
          </form>
        )}
      </main>
    </div>
  );
}

export default Checkout;
