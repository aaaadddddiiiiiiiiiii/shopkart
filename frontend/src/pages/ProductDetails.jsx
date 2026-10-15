import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProductById } from '../services/api';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error' | 'not-found'

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setStatus('loading');
      try {
        const { data } = await getProductById(id);
        if (isMounted) {
          setProduct(data.product);
          setStatus('ready');
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus(err.response?.status === 404 ? 'not-found' : 'error');
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/products"
          className="text-sm font-medium text-[var(--sk-clay)] underline"
        >
          ← Back to products
        </Link>

        {status === 'loading' && (
          <p className="mt-8 text-sm text-[var(--sk-ink)]/70">Loading product...</p>
        )}

        {status === 'error' && (
          <p className="mt-8 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            Something went wrong while loading this product.
          </p>
        )}

        {status === 'not-found' && (
          <p className="mt-8 text-sm text-[var(--sk-ink)]/70">Product not found.</p>
        )}

        {status === 'ready' && product && (
          <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-[var(--sk-line)] bg-white">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--sk-clay)]">
                {product.category}
              </span>
              <h1 className="font-display mt-1 text-2xl font-semibold text-[var(--sk-ink)]">
                {product.name}
              </h1>
              <p className="mt-3 text-2xl font-semibold text-[var(--sk-moss-dark)]">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--sk-ink)]/80">
                {product.description}
              </p>
              <p
                className={`mt-4 text-sm font-medium ${
                  product.stock > 0 ? 'text-[var(--sk-moss)]' : 'text-red-600'
                }`}
              >
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
              </p>

              <button
                type="button"
                disabled={product.stock === 0}
                className="mt-6 w-full rounded-md bg-[var(--sk-moss)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sk-moss-dark)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
