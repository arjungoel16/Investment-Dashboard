import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar.js';
import './styling/forex.css';

function Forex() {
  const [forexRates, setForexRates] = useState([]);
  const [forexNews, setForexNews] = useState([]);
  const [error, setError] = useState('');

  // Fetch live forex rates
  useEffect(() => {
    const fetchForexRates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/forex/live-rates');
        setForexRates(response.data);
      } catch (err) {
        console.error('Error fetching forex rates:', err);
        setError('Failed to fetch forex rates');
      }
    };

    fetchForexRates();
  }, []);

  // Fetch forex-related news
  useEffect(() => {
    const fetchForexNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/forex/news');
        const sortedArticles = response.data.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setForexNews(sortedArticles);
      } catch (err) {
        console.error('Error fetching forex news:', err);
        setError('Failed to fetch forex news');
      }
    };

    fetchForexNews();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="forex-container">
        <h2>Foreign Exchange Market</h2>

        {/* Forex Rates Section */}
        <div className="live-rates-section">
          <h3>Live Exchange Rates</h3>
          {error && <p className="error">{error}</p>}
          <ul className="horizontal-list">
            {forexRates.map((rate) => (
              <li key={rate.symbol}>
                <strong>{rate.symbol}:</strong> {rate.rate ? rate.rate : 'Loading...'}
              </li>
            ))}
          </ul>
        </div>
        {/* Navigate to different pages */}
        <div className="navigation-buttons">
          <button onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button onClick={() => navigate('/news/global')}>Global News</button>
          <button onClick={() => navigate('/news/us')}>US News</button>
          <button onClick={() => navigate('/graph-analysis')}>Graph Analysis</button>
          <button onClick={() => navigate('/about')}>About Us</button>
        </div>
        {/* Forex News Section */}
        <div className="forex-news-section">
          <h3>Forex Market News</h3>
          {error && <p className="error">{error}</p>}
          {forexNews.length > 0 ? (
            forexNews.map((article, index) => (
              <div key={index} className="news-article">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <h4>{article.title}</h4>
                </a>
                <p>{article.summary}</p>
                <small>Published on: {new Date(article.releaseDate).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p>No news available at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Forex;
