import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { loginCustomer } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // withCredentials on the shared axios instance ensures the
      // HttpOnly "token" cookie set by the backend is stored by the browser.
      await loginCustomer(form);
      // Load this user's cart into the shared cart state
      await refreshCart();
      navigate('/home', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid Credentials');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sk-paper)] px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          Log in to ShopKart
        </h1>
        <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
          New here?{' '}
          <Link to="/register" className="font-medium text-[var(--sk-clay)] underline">
            Create an account
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--sk-ink)]">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="w-full rounded-md border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--sk-moss)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--sk-ink)]">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--sk-moss)]"
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[var(--sk-moss)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)] disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
