const CATEGORIES = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search products..."
        className="w-full rounded-md border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--sk-moss)] sm:flex-1"
      />

      <select
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="w-full rounded-md border border-[var(--sk-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--sk-moss)] sm:w-48"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === 'All Categories' ? '' : cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchBar;
