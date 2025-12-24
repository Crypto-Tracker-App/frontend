import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Home.css';

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch coins from backend API
    // For now, using mock data
    const fetchCoins = async () => {
      setLoading(true);
      // Simulated API call
      setTimeout(() => {
        const mockCoins = [
          { id: 1, symbol: 'BTC', name: 'Bitcoin', price: 42500.50, change24h: 2.5 },
          { id: 2, symbol: 'ETH', name: 'Ethereum', price: 2250.75, change24h: -1.2 },
          { id: 3, symbol: 'BNB', name: 'Binance Coin', price: 305.20, change24h: 0.8 },
          { id: 4, symbol: 'ADA', name: 'Cardano', price: 0.52, change24h: 3.1 },
          { id: 5, symbol: 'SOL', name: 'Solana', price: 98.45, change24h: -0.5 },
          { id: 6, symbol: 'XRP', name: 'Ripple', price: 0.61, change24h: 1.9 },
          { id: 7, symbol: 'DOT', name: 'Polkadot', price: 7.32, change24h: -2.1 },
          { id: 8, symbol: 'DOGE', name: 'Dogecoin', price: 0.08, change24h: 5.3 },
        ];
        setCoins(mockCoins);
        setLoading(false);
      }, 500);
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
                  <tr key={coin.id}>
                    <td>{index + 1}</td>
                    <td className="coin-name">{coin.name}</td>
                    <td className="coin-symbol">{coin.symbol}</td>
                    <td className="coin-price">${coin.price.toLocaleString()}</td>
                    <td className={coin.change24h >= 0 ? 'change-positive' : 'change-negative'}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
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
