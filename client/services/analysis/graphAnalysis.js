import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto'; // Import Chart.js or your preferred graph library
import './GraphAnalysis.css';

function GraphAnalysis() {
  const [watchlist, setWatchlist] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedRange, setSelectedRange] = useState('1D');
  const [graphData, setGraphData] = useState({});
  const navigate = useNavigate();

  const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'All'];
  useEffect(() => {
    Object.keys(graphData).forEach((ticker) => {
      const ctx = document.getElementById(`chart-${ticker}`).getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: graphData[ticker].map((_, index) => `Point ${index + 1}`),
          datasets: [
            {
              label: ticker,
              data: graphData[ticker],
              borderColor: 'blue',
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: 'Time' },
            },
            y: {
              title: { display: true, text: 'Price' },
            },
          },
        },
      });
    });
  }, [graphData]);


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

  const toggleIndustry = (industry) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  };

  const fetchGraphData = async (ticker, range) => {
    try {
      const response = await axios.get(`http://localhost:5000/stocks/graph-data`, {
        params: { ticker, range },
      });
      return response.data;
    } catch (err) {
      console.error(`Error fetching graph data for ${ticker} (${range}):`, err);
      return [];
    }
  };

  const handleRangeChange = async (range) => {
    setSelectedRange(range);

    const data = {};
    for (const industry of selectedIndustries) {
      for (const stock of groupedWatchlist[industry]) {
        data[stock.ticker] = await fetchGraphData(stock.ticker, range);
      }
    }
    setGraphData(data);
  };

  useEffect(() => {
    if (selectedIndustries.length > 0) {
      handleRangeChange(selectedRange);
    }
  }, [selectedIndustries]);

  return (
    <div>
      <h2>Graph Analysis</h2>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>

      {/* Date Range Buttons */}
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

      {/* Graphs by Industry */}
      {Object.keys(groupedWatchlist).map((industry) => (
        <div key={industry}>
          <button onClick={() => toggleIndustry(industry)}>
            {selectedIndustries.includes(industry) ? `Remove ${industry}` : `Add ${industry}`}
          </button>
          {selectedIndustries.includes(industry) && (
            <div>
              <h3>{industry}</h3>
              {groupedWatchlist[industry].map((stock) => (
                <div key={stock.ticker} className="stock-graph">
                  <h4>{stock.name} ({stock.ticker})</h4>
                  {/* Render Graph */}
                  {graphData[stock.ticker] ? (
                    <canvas id={`chart-${stock.ticker}`} />
                  ) : (
                    <p>Loading data...</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default GraphAnalysis;
