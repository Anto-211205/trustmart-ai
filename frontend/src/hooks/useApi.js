import { useState, useEffect, useCallback } from 'react';

/**
 * Generic API hook for managing loading, error, and data states.
 * @param {Function} apiFn - The API function to call
 * @param {Array} args - Arguments to pass to the API function
 * @param {boolean} immediate - Whether to call immediately on mount (default: true)
 */
export function useApi(apiFn, args = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...overrideArgs) => {
    setLoading(true);
    setError(null);
    try {
      const callArgs = overrideArgs.length > 0 ? overrideArgs : args;
      const result = await apiFn(...callArgs);
      setData(result);
      return result;
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn, ...args]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const refetch = useCallback(() => execute(), [execute]);

  return { data, loading, error, refetch };
}

/**
 * Fetch multiple API calls in parallel with unified loading state.
 * @param {Array<{fn: Function, args: Array}>} calls - Array of API call configs
 */
export function useParallelApi(calls) {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = calls.map(({ fn, args = [] }) =>
        fn(...args).catch(err => ({ __error: true, message: err?.message }))
      );
      const resolved = await Promise.all(promises);
      const resultMap = {};
      calls.forEach((call, i) => {
        const key = call.key || `result_${i}`;
        resultMap[key] = resolved[i];
      });
      setResults(resultMap);
    } catch (err) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => execute(), [execute]);

  return { results, loading, error, refetch };
}
