// Runtime configuration loader
// This module reads configuration from window.__APP_CONFIG__ which is loaded
// at runtime from /config.js (mounted via Kubernetes ConfigMap)

const getConfig = () => {
  if (typeof window !== 'undefined' && window.__APP_CONFIG__) {
    return window.__APP_CONFIG__;
  }
  
  // Fallback for development or if config is not loaded
  console.warn('Runtime config not found, using defaults');
  return {
    API_BASE_URL: 'http://localhost',
    VAPID_PUBLIC_KEY: 'your_public_key_here',
  };
};

const config = getConfig();

// Export individual config values for easy access
export const API_BASE_URL = config.API_BASE_URL;
export const VAPID_PUBLIC_KEY = config.VAPID_PUBLIC_KEY;

// Service-specific URLs
export const USER_SERVICE_URL = `${API_BASE_URL}/user-service`;
export const PRICING_SERVICE_URL = `${API_BASE_URL}/pricing-service`;
export const PORTFOLIO_SERVICE_URL = `${API_BASE_URL}/portfolio-service`;
export const ALERT_SERVICE_URL = `${API_BASE_URL}/alert-service`;

// Export the entire config object
export default config;
