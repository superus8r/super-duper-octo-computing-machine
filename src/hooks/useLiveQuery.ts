import { useEffect, useState, useCallback } from 'react';
import { dbEvents } from '../lib/db';

/**
 * Hook for live database queries that automatically refresh when data changes
 */
export function useLiveQuery<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
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
  }, dependencies);

  // Initial query
  useEffect(() => {
    executeQuery();
  }, [executeQuery]);

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

  // Fallback polling for browsers that don't support custom events
  useEffect(() => {
    if (!eventName) return;
    
    const intervalId = setInterval(() => {
      executeQuery();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [eventName, executeQuery]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  };
}