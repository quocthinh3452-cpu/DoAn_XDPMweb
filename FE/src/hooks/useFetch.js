import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * Works with any async service function.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(getProducts, { category: 'smartphone' })
 */
export function useFetch(fetchFn, params = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = params !== null ? await fetchFn(params) : await fetchFn();
      setData(result.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
