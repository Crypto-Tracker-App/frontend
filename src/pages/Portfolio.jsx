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
  const [coinData, setCoinData] = useState({}); // Cache for coin data
  const [newCoin, setNewCoin] = useState({
    coinId: '',
    amount: '',
    buyPrice: ''
  });

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
            setPortfolio(JSON.parse(savedPortfolio));
          }
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
        // Fallback to localStorage
        const savedPortfolio = localStorage.getItem(`portfolio_${user?.id}`);
        if (savedPortfolio) {
          setPortfolio(JSON.parse(savedPortfolio));
        }
      }
    };

    if (user?.id && hasToken) {
      fetchPortfolio();
    }
  }, [user, hasToken]);

  const fetchCoinPrices = async (portfolioItems) => {
    const newCoinData = { ...coinData };
    for (const coin of portfolioItems) {
      try {
        // Fetch by coin ID (e.g., bitcoin, ethereum)
        const response = await CoinService.getCoinById(coin.coinId);
        if (response.status === 'success' && response.data) {
          newCoinData[coin.coinId] = response.data.current_price;
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${coin.symbol}:`, error);
        // Keep the buy price as fallback
        newCoinData[coin.coinId] = coin.buyPrice;
      }
    }
    setCoinData(newCoinData);
  };

  // Set up interval to refresh prices every 30 seconds when market data is updated
  useEffect(() => {
    if (portfolio.length === 0) return;

    // Fetch prices immediately
    fetchCoinPrices(portfolio);

    // Set up interval to refresh prices every 5 minutes
    const priceRefreshInterval = setInterval(() => {
      fetchCoinPrices(portfolio);
    }, 300000); // 5 minutes

    // Clean up interval on unmount or when portfolio changes
    return () => clearInterval(priceRefreshInterval);
  }, [portfolio]);

  useEffect(() => {
    // Calculate total portfolio value using current prices
    const total = portfolio.reduce((sum, coin) => {
      const currentPrice = coinData[coin.coinId] || coin.buyPrice;
      return sum + (coin.amount * currentPrice);
    }, 0);
    setTotalValue(total);
  }, [portfolio, coinData]);

  const handleAddCoin = async (e) => {
    e.preventDefault();
    
    if (!newCoin.coinId || !newCoin.amount || !newCoin.buyPrice) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const coinIdLower = newCoin.coinId.toLowerCase();
      
      // Add holding to backend
      await PortfolioService.addHolding(
        coinIdLower,
        parseFloat(newCoin.amount)
      );

      // Fetch real-time price for the coin using the /coin/<coin_id> endpoint
      let currentPrice = parseFloat(newCoin.buyPrice);
      let coinName = coinIdLower;
      let coinSymbol = '';
      
      try {
        const coinResponse = await CoinService.getCoinById(coinIdLower);
        if (coinResponse.status === 'success' && coinResponse.data) {
          currentPrice = coinResponse.data.current_price;
          coinName = coinResponse.data.name || coinIdLower;
          coinSymbol = coinResponse.data.symbol || coinIdLower.toUpperCase();
        }
      } catch (error) {
        console.error(`Failed to fetch current price for ${coinIdLower}:`, error);
        // Use buy price as fallback
      }

      const coinToAdd = {
        id: Date.now(),
        coinId: coinIdLower,
        name: coinName,
        symbol: coinSymbol.toUpperCase(),
        amount: parseFloat(newCoin.amount),
        buyPrice: parseFloat(newCoin.buyPrice),
        timestamp: new Date().toISOString()
      };

      const updatedPortfolio = [...portfolio, coinToAdd];
      setPortfolio(updatedPortfolio);
      
      // Update coin data cache with current price
      const newCoinDataCache = { ...coinData };
      newCoinDataCache[coinIdLower] = currentPrice;
      setCoinData(newCoinDataCache);
      
      localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
      
      setNewCoin({ coinId: '', amount: '', buyPrice: '' });
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
        // Try to remove from backend, but don't fail if it doesn't exist
        try {
          await PortfolioService.removeHolding(coinToRemove.coinId);
        } catch (backendError) {
          // If it's a 404 (holding not found), it's likely an old holding stored locally
          // Still remove it from local state and storage
          console.warn(`Holding "${coinToRemove.symbol}" not found in backend, removing from local storage:`, backendError);
        }
        
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

  const calculateProfit = (coin, currentPrice) => {
    const profit = (currentPrice - coin.buyPrice) * coin.amount;
    const profitPercent = ((currentPrice - coin.buyPrice) / coin.buyPrice) * 100;
    return { profit, profitPercent };
  };

  return (
    <div className="portfolio-container">
      <header className="portfolio-header">
        <div className="header-content">
          <h1>My Portfolio</h1>
          <div className="user-info">
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <p className="total-value">€{totalValue.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</p>
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
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddCoin} className="add-form">
            <h3>Add New Coin</h3>
            <div className="form-group">
              <label>Coin ID (e.g., bitcoin, ethereum)</label>
              <input
                type="text"
                value={newCoin.coinId}
                onChange={(e) => setNewCoin({...newCoin, coinId: e.target.value})}
                placeholder="bitcoin"
              />
            </div>
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
                placeholder="50000"
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
                const currentPrice = coinData[coin.coinId] || coin.buyPrice;
                const { profit, profitPercent } = calculateProfit(coin, currentPrice);
                return (
                  <tr key={coin.id}>
                    <td className="coin-symbol">{coin.symbol}</td>
                    <td>{coin.amount.toFixed(8)}</td>
                    <td>€{coin.buyPrice.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</td>
                    <td>€{currentPrice.toLocaleString('de-DE', { maximumFractionDigits: 2 })}</td>
                    <td>€{(coin.amount * currentPrice).toLocaleString('de-DE', { maximumFractionDigits: 2 })}</td>
                    <td className={profit >= 0 ? 'profit' : 'loss'}>
                      €{profit.toLocaleString('de-DE', { maximumFractionDigits: 2 })} ({profitPercent.toFixed(2)}%)
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
