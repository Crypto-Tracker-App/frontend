import React from 'react';
import useRealtimeAlerts from '../hooks/useRealtimeAlerts';
import AlertNotification from './AlertNotification';
import './AlertContainer.css';

export const AlertContainer = ({ authToken }) => {
  const { alerts, dismissAlert } = useRealtimeAlerts(authToken);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <AlertNotification
          key={alert.id}
          alert={alert}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default AlertContainer;
