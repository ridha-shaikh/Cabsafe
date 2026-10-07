import { useState, useEffect } from 'react';

export function useServiceData<T>(fetchFn: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (mounted) setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    
    // Auto-refresh every 2 seconds for the simulation demo
    const interval = setInterval(load, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchFn]);

  return { data, loading };
}
