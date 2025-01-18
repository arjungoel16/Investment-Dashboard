import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//styling component
import './AuthForm.css';

function AuthForm({ type }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const isFormValid = () => email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setMessage('Please fill in all fields.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      setMessage(response.data.message || 'Success!');
      if (type === 'login') {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setMessage(error.response?.data.error || 'Something went wrong.');
    }
  };

  return (
    <div>
      <h2>{type === 'login' ? 'Log In' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{type === 'login' ? 'Log In' : 'Sign Up'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AuthForm;
