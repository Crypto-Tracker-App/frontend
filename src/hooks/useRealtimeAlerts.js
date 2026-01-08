import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useRealtimeAlerts = (authToken) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      auth: {
        token: authToken,
      },
    });

    // Handle connection
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate after connection
      newSocket.emit('authenticate', { token: authToken });
    });

    // Handle authentication response
    newSocket.on('authenticated', (data) => {
      console.log('Authenticated:', data);
    });

    // Handle alert triggered event
    newSocket.on('alert_triggered', (alert) => {
      console.log('Alert triggered:', alert);
      setAlerts((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...alert,
        },
      ]);
    });

    // Handle errors
    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle disconnection
    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [authToken]);

  // Function to clear an alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  // Function to clear all alerts
  const dismissAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    isConnected,
    dismissAlert,
    dismissAllAlerts,
  };
};

export default useRealtimeAlerts;
