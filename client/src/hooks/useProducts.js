import { useState, useEffect, useCallback, useRef } from 'react';
import { getProducts } from '../services/api';

/**
 * useProducts — fetches products from the API with debounced search,
 * filtering, sorting, and pagination.
 *
 * @param {Object} params
 * @param {string}  params.search
 * @param {string}  params.category   - slug, ObjectId, or 'all'
 * @param {number}  params.maxPrice
 * @param {string}  params.sort       - 'newest' | 'price-low-high' | 'price-high-low'
 * @param {number}  params.page
 * @param {number}  [params.limit]
 * @param {boolean} [params.featured]
 */
export default function useProducts({
  search = '',
  category = 'all',
  maxPrice,
  sort = 'newest',
  page = 1,
  limit = 12,
  featured,
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { sort, page, limit };

      if (debouncedSearch) params.search = debouncedSearch;
      if (category && category !== 'all') params.category = category;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
      if (featured !== undefined) params.featured = featured;

      const data = await getProducts(params);
      setProducts(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, maxPrice, sort, page, limit, featured]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, total, pages, refetch: fetchProducts };
}
