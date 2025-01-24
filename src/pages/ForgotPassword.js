import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [action, setAction] = useState('username'); // 'username' or 'password'

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (action === 'username') {
        response = await axios.post('http://localhost:5000/forgot-username', { email });
      } else {
        response = await axios.post('http://localhost:5000/reset-password', { email, new_password: newPassword });
      }
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data.error || 'Something went wrong.');
    }
  };

  return (
    <div>
      <h2>{action === 'username' ? 'Forgot Username' : 'Reset Password'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {action === 'password' && (
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        )}
        <button type="submit">{action === 'username' ? 'Retrieve Username' : 'Reset Password'}</button>
      </form>
      <p>{message}</p>
      <button onClick={() => setAction('username')}>Forgot Username</button>
      <button onClick={() => setAction('password')}>Reset Password</button>
    </div>
  );
}

export default ForgotPassword;
