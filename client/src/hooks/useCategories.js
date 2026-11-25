import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';

/**
 * useCategories — fetches and caches the active category list.
 * @param {Object} [options]
 * @param {boolean} [options.all] - Admin: include inactive categories
 */
export default function useCategories({ all = false } = {}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = all ? { all: 'true' } : {};
        const data = await getCategories(params);
        if (!cancelled) setCategories(data.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [all]);

  return { categories, loading, error };
}
