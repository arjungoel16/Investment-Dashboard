import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LiveIndexes from '../components/LiveIndexes';
import Navbar from '../components/Navbar';
import './Dashboard.css';

function Dashboard() {
  const [watchlist, setWatchlist] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [forexRates, setForexRates] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the user's watchlist
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/stocks/watchlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlist(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load watchlist');
      }
    };

    fetchWatchlist();
  }, []);

  // Fetch live commodities and futures data
  useEffect(() => {
    const fetchCommodities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/commodities/live-prices');
        setCommodities(response.data);
      } catch (err) {
        console.error('Error fetching commodities:', err);
      }
    };

    fetchCommodities();
  }, []);

  // Fetch live forex rates
  useEffect(() => {
    const fetchForexRates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/forex/live-rates');
        setForexRates(response.data);
      } catch (err) {
        console.error('Error fetching forex rates:', err);
      }
    };

    fetchForexRates();
  }, []);

  // Group stocks by industry
  const groupByIndustry = (stocks) => {
    return stocks.reduce((groups, stock) => {
      const { industry } = stock;
      if (!groups[industry]) {
        groups[industry] = [];
      }
      groups[industry].push(stock);
      return groups;
    }, {});
  };

  const groupedWatchlist = groupByIndustry(watchlist);

  return (
    <div>
      <Navbar />
      
      {/* Watchlist as Main Component */}
      <h2>Dashboard</h2>
      <div className="watchlist-container">
        <h3>Your Watchlist</h3>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : watchlist.length > 0 ? (
          Object.keys(groupedWatchlist).map((industry) => (
            <div key={industry} className="industry-group">
              <h4>{industry}</h4>
              <ul>
                {groupedWatchlist[industry].map((stock) => (
                  <li key={stock.ticker}>
                    <strong>{stock.name}</strong> ({stock.ticker}) - ${stock.price}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Your watchlist is empty. Start adding stocks!</p>
        )}
      </div>

      {/* Live Index, Commodities, and Forex Section */}
      <div className="live-index-box">
        <LiveIndexes />
        <div className="commodities-container">
          <h4>Commodities & Futures</h4>
          <ul>
            {commodities.map((commodity) => (
              <li key={commodity.name}>
                <strong>{commodity.name}:</strong> ${commodity.price}
              </li>
            ))}
          </ul>
        </div>
        <div className="forex-container">
          <h4>Forex Live Rates</h4>
          <ul>
            {forexRates.map((rate) => (
              <li key={rate.symbol}>
                <strong>{rate.symbol}:</strong> {rate.rate}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* News and ETFs Navigation */}
      <div className="navigation-buttons">
        <button onClick={() => navigate('/news/global')}>View Global News</button>
        <button onClick={() => navigate('/news/us')}>View US News</button>
        <button onClick={() => navigate('/etfs-futures')}>Research US ETFs & Futures</button>
        <button onClick={() => navigate('/forex')}>Research Forex Market</button>
      </div>
    </div>
  );
}

export default Dashboard;
