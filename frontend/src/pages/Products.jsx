import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { getProducts } from '../services/api';

function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let isMounted = true;

    // Debounce so we don't fire a request on every keystroke —
    // wait 400ms after the user stops typing.
    const timer = setTimeout(async () => {
      setStatus('loading');
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;

        const { data } = await getProducts(params);
        if (isMounted) {
          setProducts(data.products);
          setStatus('ready');
        }
      } catch {
        if (isMounted) setStatus('error');
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <div className="min-h-screen bg-[var(--sk-paper)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-display text-2xl font-semibold text-[var(--sk-moss-dark)]">
          Products
        </h1>

        <div className="mt-6">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        <div className="mt-8">
          {status === 'loading' && (
            <p className="text-sm text-[var(--sk-ink)]/70">Loading products...</p>
          )}

          {status === 'error' && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong while loading products.
            </p>
          )}

          {status === 'ready' && products.length === 0 && (
            <p className="text-sm text-[var(--sk-ink)]/70">No products found.</p>
          )}

          {status === 'ready' && products.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Products;
