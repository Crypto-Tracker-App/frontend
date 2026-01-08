import React, { useState, useEffect } from 'react';
import './AlertNotification.css';

export const AlertNotification = ({ alert, onDismiss }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="alert-notification">
      <div className="alert-notification-content">
        <div className="alert-notification-icon">🔔</div>
        <div className="alert-notification-text">
          <div className="alert-notification-title">Price Alert Triggered!</div>
          <div className="alert-notification-message">
            {alert.coin_id.toUpperCase()} reached your threshold of ${alert.threshold_price.toFixed(2)}
          </div>
        </div>
      </div>
      <button
        className="alert-notification-close"
        onClick={onDismiss}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default AlertNotification;
