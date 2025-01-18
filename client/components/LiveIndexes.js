import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LiveIndexes() {
  const [indexes, setIndexes] = useState({
    nasdaq: null,
    sp500: null,
    dowjones: null,
  });

  const fetchIndexPrices = async () => {
    try {
      const [nasdaq, sp500, dowjones] = await Promise.all([
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^IXIC'),
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^GSPC'),
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^DJI'),
      ]);

      setIndexes({
        nasdaq: nasdaq.data.chart.result[0].meta.regularMarketPrice,
        sp500: sp500.data.chart.result[0].meta.regularMarketPrice,
        dowjones: dowjones.data.chart.result[0].meta.regularMarketPrice,
      });
    } catch (error) {
      console.error('Error fetching index prices:', error);
    }
  };


  useEffect(() => {
    fetchIndexPrices();
    const interval = setInterval(fetchIndexPrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#f4f4f4', padding: '10px' }}>
      <h3 style={{ margin: 0 }}>Live Index Prices</h3>
      <ul style={{ display: 'flex', justifyContent: 'space-around', padding: 0, listStyle: 'none' }}>
        <li><strong>Nasdaq:</strong> {indexes.nasdaq ? `$${indexes.nasdaq}` : 'Loading...'}</li>
        <li><strong>S&P 500:</strong> {indexes.sp500 ? `$${indexes.sp500}` : 'Loading...'}</li>
        <li><strong>Dow Jones:</strong> {indexes.dowjones ? `$${indexes.dowjones}` : 'Loading...'}</li>
      </ul>
    </div>
  );
}

export default LiveIndexes;
