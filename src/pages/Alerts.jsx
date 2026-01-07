import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoinService from '../services/coinService';
import AlertService from '../services/alertService';
import NotificationService from '../services/notificationService';
import '../assets/styles/Alerts.css';

const Alerts = () => {
  const { user, logout, hasToken } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    coinId: '',
    coinName: '',
    coinSymbol: '',
    thresholdPrice: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    // Fetch alerts from backend
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AlertService.getAlerts();
        if (response.alerts) {
          setAlerts(response.alerts);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        setError('Failed to load alerts. Please try again.');
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    // Check notification permission
    if (NotificationService.isSupported()) {
      setNotificationEnabled(Notification.permission === 'granted');
    }

    if (user?.id && hasToken) {
      fetchAlerts();
    }
  }, [user, hasToken]);

  const handleEnableNotifications = async () => {
    try {
      await NotificationService.subscribe(hasToken);
      setNotificationEnabled(true);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setError('Failed to enable notifications. Please try again.');
    }
  };

  const handleSearchCoin = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await CoinService.searchCoins(query, 10);
      if (response.status === 'success' && response.data) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Failed to search coins:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCoinSelect = (coin) => {
    setNewAlert({
      coinId: coin.id,
      coinName: coin.name,
      coinSymbol: coin.symbol.toUpperCase(),
      thresholdPrice: newAlert.thresholdPrice
    });
    setSelectedCoin(coin);
    setSearchResults([]);
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    
    if (!newAlert.coinId || !newAlert.thresholdPrice) {
      alert('Please select a coin and fill in the threshold price');
      return;
    }

    try {
      setError(null);
      const response = await AlertService.createAlert(
        newAlert.coinId,
        parseFloat(newAlert.thresholdPrice)
      );

      // Add the new alert to the list
      setAlerts([...alerts, {
        id: response.id,
        coin_id: response.coin_id,
        coin_name: newAlert.coinName,
        coin_symbol: newAlert.coinSymbol,
        threshold_price: response.threshold_price,
        is_active: response.is_active,
        created_at: response.created_at
      }]);
      
      setNewAlert({ coinId: '', coinName: '', coinSymbol: '', thresholdPrice: '' });
      setSelectedCoin(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
      setError('Failed to create alert. Please try again.');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      setError(null);
      await AlertService.deleteAlert(alertId);
      
      // Remove the alert from the list
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to delete alert:', error);
      setError('Failed to delete alert. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="alerts-container">
      <header className="alerts-header">
        <div className="header-content">
          <h1>My Price Alerts</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="alerts-actions">
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-button"
        >
          {showAddForm ? 'Cancel' : '+ Add Alert'}
        </button>
        {NotificationService.isSupported() && !notificationEnabled && (
          <button 
            onClick={handleEnableNotifications}
            className="notification-button"
          >
            🔔 Enable Push Notifications
          </button>
        )}
        {notificationEnabled && (
          <span className="notification-enabled">🔔 Notifications Enabled</span>
        )}
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddAlert} className="add-form">
            <h3>Create New Price Alert</h3>
            <div className="form-group">
              <label>Name or Symbol (e.g., Bitcoin, BTC, Ethereum, ETH)</label>
              <input
                type="text"
                value={newAlert.coinSymbol}
                onChange={(e) => {
                  setNewAlert({...newAlert, coinSymbol: e.target.value});
                  handleSearchCoin(e.target.value);
                }}
                placeholder="Bitcoin or BTC"
                autoComplete="off"
              />
              {searchLoading && <div className="search-loading">Searching...</div>}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((coin) => (
                    <div
                      key={coin.id}
                      className="search-result-item"
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <div className="coin-info">
                        <div className="coin-name">{coin.name} ({coin.symbol.toUpperCase()})</div>
                        <div className="coin-price">€{coin.current_price?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCoin && (
              <div className="selected-coin-info">
                <p>✓ Selected: {selectedCoin.name} ({selectedCoin.symbol.toUpperCase()}) - Current Price: €{selectedCoin.current_price?.toFixed(2)}</p>
              </div>
            )}
            <div className="form-group">
              <label>Threshold Price (€)</label>
              <input
                type="number"
                step="0.01"
                value={newAlert.thresholdPrice}
                onChange={(e) => setNewAlert({...newAlert, thresholdPrice: e.target.value})}
                placeholder="50000"
              />
            </div>
            <button type="submit" className="submit-button">Create Alert</button>
          </form>
        </div>
      )}

      <div className="alerts-list">
        {loading ? (
          <div className="loading">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="empty-alerts">
            <p>No price alerts yet</p>
            <p className="subtitle">Create your first alert to get notified when a coin reaches your target price!</p>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <h3 className="coin-id">{alert.coin_name || alert.coin_id} ({alert.coin_symbol || alert.coin_id.toUpperCase()})</h3>
                  <span className={`status ${alert.is_active ? 'active' : 'inactive'}`}>
                    {alert.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="alert-details">
                  <div className="detail-row">
                    <span className="label">Target Price:</span>
                    <span className="value">€{parseFloat(alert.threshold_price).toLocaleString('de-DE', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created:</span>
                    <span className="value">{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="delete-button"
                >
                  Delete Alert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;