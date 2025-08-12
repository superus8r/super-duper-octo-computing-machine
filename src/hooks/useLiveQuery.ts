import { useEffect, useState, useCallback } from 'react';
import { dbEvents } from '../lib/db';

/**
 * Hook for live database queries that automatically refresh when data changes
 */
export function useLiveQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: unknown[] = [],
  eventName?: string
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const executeQuery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial query
  useEffect(() => {
    executeQuery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  // Listen for database changes
  useEffect(() => {
    if (eventName) {
      const handleChange = () => {
        executeQuery();
      };

      dbEvents.on(eventName, handleChange);
      return () => dbEvents.off(eventName, handleChange);
    }
  }, [eventName, executeQuery]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  };
}