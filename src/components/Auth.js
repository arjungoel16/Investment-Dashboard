import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styling/Auth.css";

function Auth() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/signup", { email, password });
      setMessage("Signup successful! Please check your email to verify your account.");
    } catch (error) {
      setMessage(error.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard"); // Redirect to the dashboard on successful login
      }
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h1>Welcome to Investment Dashboard</h1>
      <form onSubmit={isSignUp ? handleSignup : handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
      </form>
      {message && <p className="message">{message}</p>}
      {isSignUp && (
        <button className="toggle-button" onClick={() => setIsSignUp(false)}>
          Already have an account? Log In
        </button>
      )}
      {!isSignUp && (
        <button className="toggle-button" onClick={() => setIsSignUp(true)}>
          Don't have an account? Sign Up
        </button>
      )}
    </div>
  );
}

export default Auth;
