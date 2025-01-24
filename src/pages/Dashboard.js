import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveIndexes from '../components/LiveIndexes';
import Navbar from './components/Navbar';
import './styling/Dashboard.css';


function Dashboard() {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [previousWatchlist, setPreviousWatchlist] = useState([]);
  const [error, setError] = useState('');

  // Fetch the user's watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/stocks/watchlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setPreviousWatchlist(watchlist); // Save current watchlist for comparison
        setWatchlist(data);
      } catch (err) {
        setError('Failed to load watchlist');
      }
    };

    fetchWatchlist();
  }, []);

  // Group stocks by industry
  const groupByIndustry = (stocks) =>
    stocks.reduce((groups, stock) => {
      const { industry } = stock;
      if (!groups[industry]) {
        groups[industry] = [];
      }
      groups[industry].push(stock);
      return groups;
    }, {});

  const groupedWatchlist = groupByIndustry(watchlist);

  // Determine text color based on price change
  const getPriceStyle = (currentPrice, previousPrice) => {
    if (!previousPrice || currentPrice === previousPrice) {
      return { color: 'black' }; // No change
    }
    return currentPrice > previousPrice
      ? { color: 'green', fontWeight: 'bold' } // Price went up
      : { color: 'red', fontWeight: 'bold' }; // Price went down
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* Main Layout */}
      <div className="dashboard-grid">
        {/* Live Market Data Section */}
        <div className="live-market-section">
          <LiveIndexes />
        </div>

        {/* Navigation Buttons */}
        <div className="navigation-section">
          <button onClick={() => navigate('/news/global')}>Global News</button>
          <button onClick={() => navigate('/news/us')}>US News</button>
          <button onClick={() => navigate('/graph-analysis')}>Graph Analysis</button>
          <button onClick={() => navigate('/forex')}>Forex Market</button>
        </div>

        {/* Watchlist Section */}
        <div className="watchlist-section">
          <h3>Your Watchlist</h3>
          {error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : watchlist.length > 0 ? (
            Object.keys(groupedWatchlist).map((industry) => (
              <div key={industry} className="industry-group">
                <h4>{industry}</h4>
                <ul>
                  {groupedWatchlist[industry].map((stock) => {
                    const previousStock = previousWatchlist.find(
                      (prev) => prev.ticker === stock.ticker
                    );
                    const previousPrice = previousStock ? previousStock.price : undefined;
                    return (
                      <li key={stock.ticker}>
                        <strong>{stock.name}</strong> ({stock.ticker}) -{' '}
                        <span style={getPriceStyle(stock.price, previousPrice)}>
                          ${stock.price}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          ) : (
            <p>Your watchlist is empty. Start adding stocks!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
