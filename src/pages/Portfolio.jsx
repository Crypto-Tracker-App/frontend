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

  useEffect(() => {
    // Calculate total portfolio value
    const total = portfolio.reduce((sum, coin) => {
      return sum + (coin.amount * coin.currentPrice);
    }, 0);
    setTotalValue(total);
  }, [portfolio]);

  const handleAddCoin = async (e) => {
    e.preventDefault();
    
    if (!newCoin.symbol || !newCoin.amount || !newCoin.buyPrice) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Add holding to backend
      const portfolioResponse = await PortfolioService.addHolding(
        newCoin.symbol.toLowerCase(),
        parseFloat(newCoin.amount)
      );

      // Fetch real-time price for the coin
      const coinResponse = await CoinService.getCoinById(newCoin.symbol.toLowerCase());
      const currentPrice = coinResponse.data?.current_price || parseFloat(newCoin.buyPrice);

      const coinToAdd = {
        id: Date.now(),
        symbol: newCoin.symbol.toUpperCase(),
        amount: parseFloat(newCoin.amount),
        buyPrice: parseFloat(newCoin.buyPrice),
        currentPrice: currentPrice,
        timestamp: new Date().toISOString()
      };

      const updatedPortfolio = [...portfolio, coinToAdd];
      setPortfolio(updatedPortfolio);
      localStorage.setItem(`portfolio_${user?.id}`, JSON.stringify(updatedPortfolio));
      
      setNewCoin({ symbol: '', amount: '', buyPrice: '' });
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
        await PortfolioService.removeHolding(coinToRemove.symbol.toLowerCase());
        
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
          <p className="total-value">${totalValue.toFixed(2)}</p>
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
              <label>Symbol (e.g., BTC, ETH)</label>
              <input
                type="text"
                value={newCoin.symbol}
                onChange={(e) => setNewCoin({...newCoin, symbol: e.target.value})}
                placeholder="BTC"
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
              <label>Buy Price ($)</label>
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
                const { profit, profitPercent } = calculateProfit(coin);
                return (
                  <tr key={coin.id}>
                    <td className="coin-symbol">{coin.symbol}</td>
                    <td>{coin.amount.toFixed(8)}</td>
                    <td>${coin.buyPrice.toFixed(2)}</td>
                    <td>${coin.currentPrice.toFixed(2)}</td>
                    <td>${(coin.amount * coin.currentPrice).toFixed(2)}</td>
                    <td className={profit >= 0 ? 'profit' : 'loss'}>
                      ${profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
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
