import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoinService from '../services/coinService';
import '../assets/styles/Home.css';

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        const response = await CoinService.getTopCoins(10, 0);
        if (response.status === 'success' && response.data) {
          setCoins(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch coins:', error);
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  const handlePortfolioClick = () => {
    navigate('/portfolio');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>🪙 Crypto Tracker</h1>
          <div className="header-actions">
            {isAuthenticated && (
              <button onClick={handlePortfolioClick} className="portfolio-button">
                My Portfolio
              </button>
            )}
            {isAuthenticated ? (
              <div className="user-section">
                <span className="user-name">Hello, {user?.name || user?.email}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={handleLoginClick} className="login-button">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="coins-header">
          <h2>Cryptocurrency Prices</h2>
          <p className="subtitle">Live prices updated in real-time</p>
        </div>

        {loading ? (
          <div className="loading">Loading coins...</div>
        ) : (
          <div className="coins-list">
            <table className="coins-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coin</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>24h Change</th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => (
                  <tr key={coin.id || index}>
                    <td>{index + 1}</td>
                    <td className="coin-name">{coin.name}</td>
                    <td className="coin-symbol">{coin.symbol}</td>
                    <td className="coin-price">€{typeof coin.current_price === 'number' ? coin.current_price.toLocaleString() : coin.price?.toLocaleString() || 'N/A'}</td>
                    <td className={coin.price_change_percentage_24h >= 0 ? 'change-positive' : 'change-negative'}>
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}% ({coin.price_change_24h >= 0 ? '+' : ''}€{coin.price_change_24h?.toFixed(2) || 'N/A'})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
