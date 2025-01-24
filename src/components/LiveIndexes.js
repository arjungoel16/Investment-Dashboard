import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styling/LiveIndexes.css';

function LiveIndexes() {
  const [indexes, setIndexes] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [previousPrices, setPreviousPrices] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3; // Number of items to display per page

  // Fetch index and commodity prices
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nasdaq, sp500, dowjones] = await Promise.all([
          axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^IXIC'),
          axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^GSPC'),
          axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^DJI'),
        ]);

        const indexData = [
          { name: 'Nasdaq', price: nasdaq.data.chart.result[0].meta.regularMarketPrice },
          { name: 'S&P 500', price: sp500.data.chart.result[0].meta.regularMarketPrice },
          { name: 'Dow Jones', price: dowjones.data.chart.result[0].meta.regularMarketPrice },
        ];

        setPreviousPrices((prev) => ({
          ...prev,
          ...indexData.reduce((acc, item) => ({ ...acc, [item.name]: prev[item.name] || item.price }), {}),
        }));
        setIndexes(indexData);

        const commodityResponse = await axios.get('http://localhost:5000/commodities/live-prices');
        const commodityData = commodityResponse.data.commodities;

        setPreviousPrices((prev) => ({
          ...prev,
          ...commodityData.reduce((acc, item) => ({ ...acc, [item.name]: prev[item.name] || item.price }), {}),
        }));
        setCommodities(commodityData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const combinedData = [...indexes, ...commodities];

  // Handle navigation
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? combinedData.length - itemsPerPage : prevIndex - itemsPerPage
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerPage >= combinedData.length ? 0 : prevIndex + itemsPerPage
    );
  };

  // Determine text color based on price movement
  const getPriceStyle = (currentPrice, previousPrice) => {
    if (previousPrice === undefined || currentPrice === previousPrice) {
      return { color: 'black' }; // Default color
    }
    return currentPrice > previousPrice
      ? { color: 'green', fontWeight: 'bold' }
      : { color: 'red', fontWeight: 'bold' };
  };

  return (
    <div className="live-indexes-container">
      <h3>Live Market Data</h3>
      <div className="navigation-buttons">
        <button onClick={handlePrev}>⬅️</button>
        <button onClick={handleNext}>➡️</button>
      </div>
      <ul className="live-prices-list">
        {combinedData.slice(currentIndex, currentIndex + itemsPerPage).map((item, index) => (
          <li key={index} className="live-price-item">
            <strong>{item.name}:</strong>{' '}
            <span style={getPriceStyle(item.price, previousPrices[item.name])}>
              {item.price ? `$${item.price.toFixed(2)}` : 'Loading...'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LiveIndexes;
