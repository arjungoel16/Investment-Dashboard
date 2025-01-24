import React, { useEffect, useState } from 'react';
import axios from 'axios';
import news from './styling/news.css';

function News({ type }) {
  const [query, setQuery] = useState('');
  const [news, setNews] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, [type]);

  const fetchNews = async () => {
    try {
      const endpoint = type === 'global' ? '/news/global-news' : '/news/us-news';
      const response = await axios.get(`http://localhost:5000${endpoint}`, { params: { query } });
      setNews(response.data.articles || []);
    } catch (err) {
      setError('Failed to fetch news. Please try again.');
    }
  };

  return (
    <div className="news-container">
      <div className="navigation-buttons">
        <button onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button onClick={() => navigate('/graph-analysis')}>Graph Analysis</button>
        <button onClick={() => navigate('/forex')}>Forex Market</button>
        <button onClick={() => navigate('/about')}>About Us</button>
      </div>
      <h2>{type === 'global' ? 'Global News' : 'US News'}</h2>
      <div className="news-search">
        <input
          type="text"
          placeholder="Search news..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={fetchNews}>Search</button>
      </div>
      {error && <p>{error}</p>}
      <ul>
        {news.map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <h4>{article.headline}</h4>
            </a>
            <p>{article.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default News;
