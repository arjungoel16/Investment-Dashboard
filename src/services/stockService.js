import axios from 'axios';

const API_URL = 'http://localhost:5000/stocks';

export const getWatchlist = async (token) => {
  return await axios.get(`${API_URL}/watchlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addToWatchlist = async (token, stock) => {
  return await axios.post(`${API_URL}/add`, stock, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeFromWatchlist = async (token, ticker) => {
  return await axios.post(`${API_URL}/remove`, { ticker }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
