import { useState, useEffect, useCallback } from 'react';

const useTriggeredAlerts = (authToken, pollInterval = 10000) => {
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTriggeredAlerts = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      const response = await fetch('/api/alerts/triggered', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch triggered alerts: ${response.status}`);
      }

      const data = await response.json();
      setTriggeredAlerts(data.alerts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching triggered alerts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    // Fetch immediately on mount or when authToken changes
    fetchTriggeredAlerts();

    // Set up polling interval
    const interval = setInterval(fetchTriggeredAlerts, pollInterval);

    return () => clearInterval(interval);
  }, [fetchTriggeredAlerts, pollInterval]);

  return {
    triggeredAlerts,
    loading,
    error,
    refetch: fetchTriggeredAlerts
  };
};

export default useTriggeredAlerts;
