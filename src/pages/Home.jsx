import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoinService from '../services/coinService';
import '../assets/styles/Home.css';

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [displayedCoins, setDisplayedCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const coinsPerPage = 100;

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        // Fetch all coins
        const response = await CoinService.getTopCoins(8000, 0);
        if (response.status === 'success' && response.data) {
          setCoins(response.data);
          setCurrentPage(0);
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

  useEffect(() => {
    // Filter coins based on search query
    let filtered = coins;
    if (searchQuery.trim()) {
      filtered = coins.filter((coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // If search results exist, show all on one page, otherwise paginate
    if (searchQuery.trim()) {
      setDisplayedCoins(filtered);
      setCurrentPage(0);
    } else {
      const startIndex = currentPage * coinsPerPage;
      const endIndex = startIndex + coinsPerPage;
      setDisplayedCoins(filtered.slice(startIndex, endIndex));
    }
  }, [searchQuery, coins, currentPage]);

  const handlePortfolioClick = () => {
    navigate('/portfolio');
  };

  const handleAlertsClick = () => {
    navigate('/alerts');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(coins.length / coinsPerPage) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(coins.length / coinsPerPage);
  const isSearching = searchQuery.trim() !== '';
  const displayCount = isSearching ? displayedCoins.length : coins.length;

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>🪙 Crypto Tracker</h1>
          <div className="header-actions">
            {isAuthenticated && (
              <div className="nav-buttons">
                <button onClick={handlePortfolioClick} className="portfolio-button">
                  My Portfolio
                </button>
                <button onClick={handleAlertsClick} className="alerts-button">
                  Alerts
                </button>
              </div>
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

        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box"
          />
          <span className="search-icon">🔍</span>
        </div>

        {loading ? (
          <div className="loading">Loading coins...</div>
        ) : (
          <>
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
                  {displayedCoins.map((coin, index) => (
                    <tr key={coin.id || index}>
                      <td>
                        {isSearching
                          ? index + 1
                          : currentPage * coinsPerPage + index + 1}
                      </td>
                      <td className="coin-name">{coin.name}</td>
                      <td className="coin-symbol">{coin.symbol}</td>
                      <td className="coin-price">
                        €{typeof coin.current_price === 'number'
                          ? coin.current_price.toLocaleString()
                          : coin.price?.toLocaleString() || 'N/A'}
                      </td>
                      <td
                        className={
                          coin.price_change_percentage_24h >= 0
                            ? 'change-positive'
                            : 'change-negative'
                        }
                      >
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}% (
                        {coin.price_change_24h >= 0 ? '+' : ''}€
                        {coin.price_change_24h?.toFixed(2) || 'N/A'})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!isSearching && (
              <div className="pagination-controls">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="pagination-button"
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages} (Total: {coins.length} coins)
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className="pagination-button"
                >
                  Next →
                </button>
              </div>
            )}

            {isSearching && (
              <div className="search-results-info">
                <p>Found {displayedCoins.length} coin(s) matching your search</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
