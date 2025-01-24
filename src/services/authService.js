import axios from 'axios';

const API_URL = 'http://localhost:5000/auth';

export const login = async (email, password) => {
  return await axios.post(`${API_URL}/login`, { email, password });
};

export const register = async (email, password) => {
  return await axios.post(`${API_URL}/register`, { email, password });
};
