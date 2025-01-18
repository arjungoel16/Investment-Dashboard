import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from './Auth';

function Login() {
  return (
    <div>
      <AuthForm type="login" />
      <p>
        <Link to="/forgot-password">Forgot Username or Password?</Link>
      </p>
    </div>
  );
}

export default Login;
