import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// importing charthandler.js
import './chartHander.js';
import './styling/GraphAnalysis.css';

function GraphAnalysis() {
  const [watchlist, setWatchlist] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [selectedRange, setSelectedRange] = useState('1D');
  const [graphData, setGraphData] = useState(null);
  const navigate = useNavigate();

  const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'All'];

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
        console.error('Error fetching watchlist:', err);
      }
    };

    fetchWatchlist();
  }, []);

  // Fetch graph data for a specific stock
  const fetchGraphData = async (ticker, range) => {
    try {
      const response = await axios.get('http://localhost:5000/stocks/graph-data', {
        params: { ticker, range },
      });
      setGraphData(response.data);
    } catch (err) {
      console.error(`Error fetching graph data for ${ticker}:`, err);
    }
  };

  // Handle range change
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    if (selectedTicker) {
      fetchGraphData(selectedTicker, range);
    }
  };

  // Render the graph
  useEffect(() => {
    if (graphData && graphData.data.length > 0) {
      const ctx = document.getElementById('stock-chart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: graphData.data.map((point) => point.date),
          datasets: [
            {
              label: 'Price',
              data: graphData.data.map((point) => point.price),
              borderColor: 'blue',
              fill: false,
            },
            {
              label: 'Bollinger Bands',
              data: graphData.data.map((point) => point.bollinger),
              borderColor: 'green',
              fill: false,
            },
            {
              label: 'RSI',
              data: graphData.data.map((point) => point.rsi),
              borderColor: 'red',
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: 'Date' },
            },
            y: {
              title: { display: true, text: 'Value' },
            },
          },
        },
      });
    }
  }, [graphData]);

  return (
    <div>
      <div className="navigation-buttons">
        <button onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button onClick={() => navigate('/news/global')}>Global News</button>
        <button onClick={() => navigate('/news/us')}>US News</button>
        <button onClick={() => navigate('/forex')}>Forex Market</button>
        <button onClick={() => navigate('/about')}>About Us</button>
      </div>
      <h2>Graph Analysis</h2>

      <div className="stock-selection">
        <label htmlFor="stock-select">Select Stock:</label>
        <select
          id="stock-select"
          value={selectedTicker}
          onChange={(e) => {
            setSelectedTicker(e.target.value);
            fetchGraphData(e.target.value, selectedRange);
          }}
        >
          <option value="">--Select a Stock--</option>
          {watchlist.map((stock) => (
            <option key={stock.ticker} value={stock.ticker}>
              {stock.name} ({stock.ticker})
            </option>
          ))}
        </select>
      </div>

      <div className="date-range-buttons">
        {ranges.map((range) => (
          <button
            key={range}
            className={selectedRange === range ? 'active' : ''}
            onClick={() => handleRangeChange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="graph-container">
        {graphData ? (
          <canvas id="stock-chart" />
        ) : (
          <p>Select a stock and range to display the graph.</p>
        )}
      </div>
    </div>
  );
}

export default GraphAnalysis;
