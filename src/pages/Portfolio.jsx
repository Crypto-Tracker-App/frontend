import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CoinService from '../services/coinService';
import PortfolioService from '../services/portfolioService';
import '../assets/styles/Portfolio.css';

const Portfolio = () => {
  const { user, logout, hasToken } = useAuth();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCoin, setNewCoin] = useState({
    symbol: '',
    coinId: '',
    name: '',
    amount: '',
    buyPrice: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);

  const refreshPortfolioPrices = async (portfolioToRefresh) => {
    try {
      const updatedPortfolio = await Promise.all(
        portfolioToRefresh.map(async (coin) => {
          try {
            const coinResponse = await CoinService.getCoinById(coin.coinId);
            const currentPrice = coinResponse.data?.current_price || coin.currentPrice;
            return {
              ...coin,
              currentPrice: currentPrice,
              lastUpdated: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Failed to fetch price for ${coin.coinId}:`, error);
            return coin; // Return unchanged coin if fetch fails
          }
        })
      );
      
      setPortfolio(updatedPortfolio);
      localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error('Failed to refresh portfolio prices:', error);
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
    setNewCoin({
      symbol: coin.symbol.toUpperCase(),
      coinId: coin.id,
      name: coin.name,
      amount: newCoin.amount,
      buyPrice: newCoin.buyPrice || coin.current_price
    });
    setSelectedCoin(coin);
    setSearchResults([]);
  };

  useEffect(() => {
    // Fetch portfolio from backend
    const fetchPortfolio = async () => {
      try {
        const response = await PortfolioService.getTotalNetHolding();
        if (response.status === 'success') {
          // The response gives us total holding, we should fetch individual holdings
          // For now, load from localStorage as fallback
          const savedPortfolio = localStorage.getItem(`portfolio_${user?.id}`);
          if (savedPortfolio) {
            const portfolio = JSON.parse(savedPortfolio);
            // Refresh prices for all coins
            await refreshPortfolioPrices(portfolio);
          }
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        // Fallback to localStorage
        const savedPortfolio = localStorage.getItem(`portfolio_${user?.id}`);
        if (savedPortfolio) {
          const portfolio = JSON.parse(savedPortfolio);
          // Refresh prices for all coins
          await refreshPortfolioPrices(portfolio);
        }
      }
    };

    if (user?.id && hasToken) {
      fetchPortfolio();
    }
  }, [user, hasToken]);

  useEffect(() => {
    // Calculate total portfolio value
    const total = portfolio.reduce((sum, coin) => {
      return sum + (coin.amount * coin.currentPrice);
    }, 0);
    setTotalValue(total);
  }, [portfolio]);

  const handleAddCoin = async (e) => {
    e.preventDefault();
    
    if (!newCoin.coinId || !newCoin.amount || !newCoin.buyPrice) {
      alert('Please select a coin and fill in all fields');
      return;
    }

    try {
      // Add holding to backend
      const portfolioResponse = await PortfolioService.addHolding(
        newCoin.coinId,
        parseFloat(newCoin.amount)
      );

      // Use the current price from selected coin data
      const currentPrice = selectedCoin?.current_price || parseFloat(newCoin.buyPrice);

      const coinToAdd = {
        id: Date.now(),
        symbol: newCoin.symbol.toUpperCase(),
        coinId: newCoin.coinId,
        name: newCoin.name,
        amount: parseFloat(newCoin.amount),
        buyPrice: parseFloat(newCoin.buyPrice),
        currentPrice: currentPrice,
        timestamp: new Date().toISOString()
      };

      const updatedPortfolio = [...portfolio, coinToAdd];
      setPortfolio(updatedPortfolio);
      localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
      
      setNewCoin({ symbol: '', coinId: '', name: '', amount: '', buyPrice: '' });
      setSelectedCoin(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add coin to portfolio:', error);
      alert('Failed to add coin to portfolio. Please try again.');
    }
  };

  const handleRemoveCoin = async (id) => {
    try {
      const coinToRemove = portfolio.find(coin => coin.id === id);
      if (coinToRemove) {
        // Remove from backend
        await PortfolioService.removeHolding(coinToRemove.coinId);
        
        // Update local state
        const updatedPortfolio = portfolio.filter(coin => coin.id !== id);
        setPortfolio(updatedPortfolio);
        localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
      }
    } catch (error) {
      console.error('Failed to remove coin from portfolio:', error);
      alert('Failed to remove coin. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const calculateProfit = (coin) => {
    const profit = (coin.currentPrice - coin.buyPrice) * coin.amount;
    const profitPercent = ((coin.currentPrice - coin.buyPrice) / coin.buyPrice) * 100;
    return { profit, profitPercent };
  };

  return (
    <div className="portfolio-container">
      <header className="portfolio-header">
        <div className="header-content">
          <h1>My Portfolio</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.email}!</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <p className="total-value">€{totalValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Holdings</h3>
          <p className="holdings-count">{portfolio.length} coins</p>
        </div>
      </div>

      <div className="portfolio-actions">
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-button"
        >
          {showAddForm ? 'Cancel' : '+ Add Coin'}
        </button>
        <button 
          onClick={() => refreshPortfolioPrices(portfolio)}
          className="refresh-button"
          title="Refresh current prices"
        >
          🔄 Refresh Prices
        </button>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddCoin} className="add-form">
            <h3>Add New Coin</h3>
            <div className="form-group">
              <label>Name or Symbol (e.g., Bitcoin, BTC, Ethereum, ETH)</label>
              <input
                type="text"
                value={newCoin.symbol}
                onChange={(e) => {
                  setNewCoin({...newCoin, symbol: e.target.value});
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
              <label>Amount</label>
              <input
                type="number"
                step="0.00000001"
                value={newCoin.amount}
                onChange={(e) => setNewCoin({...newCoin, amount: e.target.value})}
                placeholder="0.5"
              />
            </div>
            <div className="form-group">
              <label>Buy Price (€)</label>
              <input
                type="number"
                step="0.01"
                value={newCoin.buyPrice}
                onChange={(e) => setNewCoin({...newCoin, buyPrice: e.target.value})}
                placeholder={selectedCoin?.current_price?.toFixed(2) || "50000"}
              />
            </div>
            <button type="submit" className="submit-button">Add to Portfolio</button>
          </form>
        </div>
      )}

      <div className="portfolio-list">
        {portfolio.length === 0 ? (
          <div className="empty-portfolio">
            <p>Your portfolio is empty. Add some coins to get started!</p>
          </div>
        ) : (
          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Coin</th>
                <th>Amount</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Value</th>
                <th>Profit/Loss</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((coin) => {
                const { profit, profitPercent } = calculateProfit(coin);
                return (
                  <tr key={coin.id}>
                    <td className="coin-symbol">{coin.name || coin.symbol} ({coin.symbol})</td>
                    <td>{coin.amount.toFixed(8)}</td>
                    <td>€{coin.buyPrice.toFixed(2)}</td>
                    <td>€{coin.currentPrice.toFixed(2)}</td>
                    <td>€{(coin.amount * coin.currentPrice).toFixed(2)}</td>
                    <td className={profit >= 0 ? 'profit' : 'loss'}>
                      €{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                    </td>
                    <td>
                      <button 
                        onClick={() => handleRemoveCoin(coin.id)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
