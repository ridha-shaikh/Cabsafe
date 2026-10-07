import React, { useState, useEffect } from 'react';

export function useServiceData<T>(fetchFn: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Keep the latest fetchFn in a ref to avoid triggering useEffect on every render
  const fetchFnRef = React.useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchFnRef.current();
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
  }, []); // Empty dependency array prevents infinite loops

  return { data, loading };
}
