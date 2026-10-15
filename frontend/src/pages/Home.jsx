import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getCurrentCustomer } from '../services/api';

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        // The cookie is HttpOnly, so we can't just check for it in
        // JS — we ask the backend who it belongs to, and let /customers/me
        // be the single source of truth for "is this user logged in".
        const { data } = await getCurrentCustomer();
        if (isMounted) setCustomer(data);
      } catch {
        if (isMounted) navigate('/login', { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sk-paper)]">
        <p className="text-sm text-[var(--sk-ink)]/70">Loading your account…</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar customerName={customer.fullName} />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          Welcome back, {customer.fullName.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-[var(--sk-ink)]/70">
          Here's what we have on file for your account.
        </p>

        <dl className="mt-8 max-w-md divide-y divide-[var(--sk-line)] rounded-lg border border-[var(--sk-line)] bg-white">
          <Row label="Full name" value={customer.fullName} />
          <Row label="Email" value={customer.email} />
          <Row label="Phone number" value={customer.phone} />
        </dl>

        <Link
          to="/products"
          className="mt-8 inline-block rounded-md bg-[var(--sk-moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)]"
        >
          Browse Products
        </Link>
      </main>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <dt className="text-sm text-[var(--sk-ink)]/60">{label}</dt>
      <dd className="text-sm font-medium text-[var(--sk-ink)]">{value}</dd>
    </div>
  );
}

export default Home;
