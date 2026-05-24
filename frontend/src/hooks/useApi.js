import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for fetching data from an async API function.
 */
export function useApi(fetchFn, deps = [], options = {}) {
  const { immediate = true, onSuccess } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Failed to fetch data');
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, onSuccess]);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      mountedRef.current = false;
    };
  }, deps);

  return { data, loading, error, refetch: execute, setData };
}

/**
 * Poll an API at a fixed interval.
 */
export function usePolling(fetchFn, intervalMs = 5000, deps = []) {
  const { data, loading, error, refetch } = useApi(fetchFn, deps);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!polling) return undefined;
    const id = setInterval(() => refetch(), intervalMs);
    return () => clearInterval(id);
  }, [polling, intervalMs, refetch]);

  return { data, loading, error, refetch, polling, setPolling };
}
